"use client"

import * as React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Context for Select state
interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

// Main Select component
interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  disabled = false
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }, [controlledValue, onValueChange])

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  // Close on click outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const content = document.querySelector('[data-cedar-select-content]')
        if (content && !content.contains(target)) {
          setOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange: handleValueChange, triggerRef }}>
      <div className="relative inline-block w-full" data-cedar-select data-disabled={disabled || undefined}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// SelectTrigger
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: "sm" | "default"
}

function SelectTrigger({
  className,
  children,
  size = "default",
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, triggerRef } = useSelectContext()

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition-all duration-200",
        "hover:border-orange-300 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        size === "default" ? "h-10" : "h-8 text-xs",
        open && "border-orange-400 ring-2 ring-orange-500/20",
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0",
          open && "rotate-180 text-orange-500"
        )}
      />
    </button>
  )
}

// SelectValue
interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext()

  // Find the selected item's label from the DOM
  const [displayValue, setDisplayValue] = useState<string | null>(null)

  useEffect(() => {
    if (value) {
      // Try to find the matching item
      const items = document.querySelectorAll(`[data-cedar-select-item][data-value="${value}"]`)
      if (items.length > 0) {
        setDisplayValue(items[0].textContent || value)
      } else {
        setDisplayValue(value)
      }
    } else {
      setDisplayValue(null)
    }
  }, [value])

  if (!displayValue) {
    return <span className="text-gray-400">{placeholder}</span>
  }

  return <span>{displayValue}</span>
}

// SelectContent
interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: "item-aligned" | "popper"
  align?: "start" | "center" | "end"
}

function SelectContent({
  children,
  className,
  position = "item-aligned",
  align = "start"
}: SelectContentProps) {
  const { open, triggerRef } = useSelectContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [open, triggerRef])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      data-cedar-select-content
      role="listbox"
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        className
      )}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        maxHeight: "min(300px, calc(100vh - 100px))"
      }}
    >
      <div className="max-h-[280px] overflow-y-auto p-1">
        {children}
      </div>
    </div>
  )
}

// SelectItem
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

function SelectItem({
  value: itemValue,
  children,
  className,
  disabled = false,
  ...props
}: SelectItemProps) {
  const { value, onValueChange } = useSelectContext()
  const isSelected = value === itemValue

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-cedar-select-item
      data-value={itemValue}
      data-selected={isSelected || undefined}
      data-disabled={disabled || undefined}
      onClick={() => !disabled && onValueChange(itemValue)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
        "hover:bg-orange-50 hover:text-orange-700",
        isSelected && "bg-orange-100 text-orange-700 font-medium",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 text-orange-600 shrink-0 ml-2" />
      )}
    </div>
  )
}

// SelectGroup
interface SelectGroupProps {
  children: React.ReactNode
  className?: string
}

function SelectGroup({ children, className }: SelectGroupProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

// SelectLabel
interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide", className)}>
      {children}
    </div>
  )
}

// SelectSeparator
function SelectSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("my-1 h-px bg-gray-100", className)} />
  )
}

// Placeholder exports to maintain compatibility
function SelectScrollUpButton() { return null }
function SelectScrollDownButton() { return null }

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
