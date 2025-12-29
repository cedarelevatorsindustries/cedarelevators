"use client"

import { Download, CircleCheck, ShoppingCart, Trash2, X } from "lucide-react"

interface BulkActionsToolbarProps {
  selectedCount: number
  onMarkAsRead?: () => void
  onExport?: () => void
  onConvertToOrder?: () => void
  onDelete?: () => void
  onClearSelection: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  onMarkAsRead,
  onExport,
  onConvertToOrder,
  onDelete,
  onClearSelection
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4 z-50 animate-slide-up">
      <span className="font-medium" role="status" aria-live="polite">
        {selectedCount} selected
      </span>
      <div className="h-6 w-px bg-gray-700" aria-hidden="true" />
      
      {onMarkAsRead && (
        <button
          onClick={onMarkAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          aria-label={`Mark ${selectedCount} items as read`}
        >
          <CircleCheck size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Mark as Read</span>
        </button>
      )}
      
      {onExport && (
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          aria-label={`Export ${selectedCount} items`}
        >
          <Download size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}
      
      {onConvertToOrder && (
        <button
          onClick={onConvertToOrder}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          aria-label={`Convert ${selectedCount} items to order`}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Convert to Order</span>
        </button>
      )}
      
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          aria-label={`Delete ${selectedCount} items`}
        >
          <Trash2 size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      )}
      
      <button
        onClick={onClearSelection}
        className="ml-2 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
        aria-label="Clear selection"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
