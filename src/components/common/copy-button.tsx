"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CopyButtonProps {
  text: string
  label?: string
  variant?: "icon" | "button" | "inline"
  className?: string
}

export function CopyButton({ text, label, variant = "icon", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm ${className}`}
        aria-label={`Copy ${label || text}`}
      >
        <span className="font-mono">{text}</span>
        {copied ? (
          <Check size={16} className="text-green-600" aria-hidden="true" />
        ) : (
          <Copy size={16} className="text-gray-600" aria-hidden="true" />
        )}
      </button>
    )
  }

  if (variant === "inline") {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors ${className}`}
        aria-label={`Copy ${label || text}`}
      >
        <span className="font-mono text-sm">{text}</span>
        {copied ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${className}`}
      aria-label={`Copy ${label || text}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={16} className="text-green-600" aria-hidden="true" />
      ) : (
        <Copy size={16} className="text-gray-600" aria-hidden="true" />
      )}
    </button>
  )
}
