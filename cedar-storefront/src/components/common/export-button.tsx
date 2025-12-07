"use client"

import { Download, FileText, FileSpreadsheet, Archive } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface ExportButtonProps {
  onExportCSV?: () => Promise<void>
  onExportPDF?: () => Promise<void>
  onExportZIP?: () => Promise<void>
  disabled?: boolean
  label?: string
}

export function ExportButton({
  onExportCSV,
  onExportPDF,
  onExportZIP,
  disabled = false,
  label = "Export"
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = async (exportFn?: () => Promise<void>, format?: string) => {
    if (!exportFn) return
    setIsExporting(true)
    try {
      await exportFn()
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const hasMultipleOptions = [onExportCSV, onExportPDF, onExportZIP].filter(Boolean).length > 1

  // Single export option - direct button
  if (!hasMultipleOptions) {
    const singleExport = onExportCSV || onExportPDF || onExportZIP
    const format = onExportCSV ? 'CSV' : onExportPDF ? 'PDF' : 'ZIP'
    
    return (
      <button
        onClick={() => handleExport(singleExport, format)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        aria-label={`Export as ${format}`}
      >
        <Download size={18} aria-hidden="true" />
        {isExporting ? 'Exporting...' : `${label} ${format}`}
      </button>
    )
  }

  // Multiple options - dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        aria-label="Export options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download size={18} aria-hidden="true" />
        {isExporting ? 'Exporting...' : label}
      </button>

      {isOpen && !isExporting && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
          role="menu"
          aria-orientation="vertical"
        >
          {onExportCSV && (
            <button
              onClick={() => handleExport(onExportCSV, 'CSV')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <FileSpreadsheet size={18} className="text-green-600" aria-hidden="true" />
              Export as CSV
            </button>
          )}
          {onExportPDF && (
            <button
              onClick={() => handleExport(onExportPDF, 'PDF')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <FileText size={18} className="text-red-600" aria-hidden="true" />
              Export as PDF
            </button>
          )}
          {onExportZIP && (
            <button
              onClick={() => handleExport(onExportZIP, 'ZIP')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <Archive size={18} className="text-blue-600" aria-hidden="true" />
              Download as ZIP
            </button>
          )}
        </div>
      )}
    </div>
  )
}
