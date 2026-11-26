"use client"

import * as React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// React-Select imports for CustomReactSelect
import ReactSelectBase, {
  components,
  DropdownIndicatorProps,
  Props as ReactSelectProps,
  ControlProps,
  OptionProps,
  GroupBase
} from 'react-select'

// Context for Select state
interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  valueLabel: string | null
  setValueLabel: (label: string | null) => void
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
  const [valueLabel, setValueLabel] = useState<string | null>(null)
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
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange: handleValueChange, triggerRef, valueLabel, setValueLabel }}>
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
        "flex w-full items-center justify-between gap-2 rounded-[8px] border bg-white px-3 text-[13px] transition-all duration-150",
        "border-[#EAE8E2] text-[#171717]",
        "hover:border-[#DCD8CE] hover:bg-[#FAFAF8]",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(232,90,36,0.15)] focus:border-[#D4895A]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9F8F5]",
        size === "default" ? "h-9" : "h-7 text-[12px]",
        open && "border-[#D4895A] ring-2 ring-[rgba(232,90,36,0.12)]",
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">{children}</span>
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-200 shrink-0",
          open ? "rotate-180" : ""
        )}
        style={{ color: open ? "#E85A24" : "#A09B94" }}
      />
    </button>
  )
}

// SelectValue
interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value, valueLabel } = useSelectContext()

  // If we have a stored label, use it. Otherwise show placeholder or nothing.
  if (!value) {
    return <span style={{ color: "#A09B94" }}>{placeholder}</span>
  }

  // Use the stored label if available
  if (valueLabel) {
    return <span style={{ color: "#171717" }}>{valueLabel}</span>
  }

  // Capitalize fallback instead of raw lowercase
  const formatted = value === "all" ? (placeholder || "All") : value.charAt(0).toUpperCase() + value.slice(1)
  return <span style={{ color: "#171717" }}>{formatted}</span>
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
  position = "popper",
  align = "start"
}: SelectContentProps) {
  const { open } = useSelectContext()

  return (
    <div
      data-cedar-select-content
      role="listbox"
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden transition-all duration-150",
        "top-[calc(100%+5px)] w-full",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      style={{
        display: open ? "block" : "none",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EAE8E2",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(23,23,23,0.09), 0 2px 6px rgba(23,23,23,0.04)",
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
  const { value, onValueChange, setValueLabel } = useSelectContext()
  const isSelected = value === itemValue
  const itemRef = useRef<HTMLDivElement>(null)

  // When this item is selected, store its label text
  const handleClick = () => {
    if (disabled) return
    // Extract text content from children for the label
    const labelText = itemRef.current?.textContent || String(children)
    setValueLabel(labelText)
    onValueChange(itemValue)
  }

  // Set label on mount if this item is already selected
  useEffect(() => {
    if (isSelected && itemRef.current) {
      const labelText = itemRef.current.textContent || String(children)
      setValueLabel(labelText)
    }
  }, [isSelected, children, setValueLabel])

  return (
    <div
      ref={itemRef}
      role="option"
      aria-selected={isSelected}
      data-cedar-select-item
      data-value={itemValue}
      data-selected={isSelected || undefined}
      data-disabled={disabled || undefined}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-[7px] px-3 py-2 text-[13px] outline-none transition-colors",
        isSelected
          ? "font-medium"
          : "text-[#171717]",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      style={
        isSelected
          ? { backgroundColor: "#FFF0E8", color: "#C04A18" }
          : undefined
      }
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F9F8F5"
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""
      }}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <Check className="h-3.5 w-3.5 shrink-0 ml-2" style={{ color: "#E85A24" }} />
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

// ============================================
// React-Select based CustomReactSelect
// ============================================

interface SelectOption {
  value: string
  label: string
}

const RSDropdownIndicator = <Option, IsMulti extends boolean>(
  props: DropdownIndicatorProps<Option, IsMulti, GroupBase<Option>>
) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </components.DropdownIndicator>
  )
}

function CustomReactSelect<
  Option = SelectOption,
  IsMulti extends boolean = false
>({ className, ...props }: ReactSelectProps<Option, IsMulti, GroupBase<Option>>) {
  return (
    <ReactSelectBase<Option, IsMulti, GroupBase<Option>>
      {...props}
      components={{
        DropdownIndicator: RSDropdownIndicator,
        IndicatorSeparator: () => null,
        ...props.components
      }}
      classNames={{
        control: (state: ControlProps<Option, IsMulti, GroupBase<Option>>) => cn(
          "flex min-h-[32px] w-full items-center justify-between rounded-lg border bg-white px-1 text-sm shadow-sm transition-all outline-none cursor-pointer",
          state.isFocused ? "border-orange-400 ring-2 ring-orange-500/10" : "border-gray-200 hover:border-orange-300 hover:shadow-sm",
          className
        ),
        container: () => cn("w-full"),
        valueContainer: () => cn("px-2 gap-1"),
        menu: () => "mt-1 rounded-lg border border-gray-100 bg-white shadow-lg p-1 z-50",
        option: (state: OptionProps<Option, IsMulti, GroupBase<Option>>) => cn(
          "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors my-0.5",
          state.isSelected ? "bg-orange-100 text-orange-700 font-medium" :
            state.isFocused ? "bg-orange-50 text-orange-700" : "text-gray-700",
        ),
        input: () => "text-sm text-gray-900 m-0 p-0",
        placeholder: () => "text-gray-400 text-sm",
        singleValue: () => "text-gray-900 text-sm",
        noOptionsMessage: () => "text-gray-400 p-2 text-sm"
      }}
      unstyled
    />
  )
}

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
  CustomReactSelect,
}

