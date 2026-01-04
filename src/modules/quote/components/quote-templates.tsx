"use client"

import { useState } from 'react'
import { FileText, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuoteTemplate {
  id: string
  name: string
  description: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
  }>
  createdAt: string
  lastUsed?: string
}

interface QuoteTemplatesProps {
  onLoadTemplate?: (template: QuoteTemplate) => void
}

export default function QuoteTemplates({ onLoadTemplate }: QuoteTemplatesProps) {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([
    {
      id: '1',
      name: 'Monthly Spare Parts',
      description: 'Regular monthly order for elevator spare parts',
      items: [
        { productId: '1', productName: 'Door Sensor', quantity: 10 },
        { productId: '2', productName: 'Control Panel', quantity: 5 },
        { productId: '3', productName: 'Safety Switch', quantity: 15 }
      ],
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    },
    {
      id: '2',
      name: 'Maintenance Kit',
      description: 'Standard maintenance supplies',
      items: [
        { productId: '4', productName: 'Lubricant Oil', quantity: 20 },
        { productId: '5', productName: 'Cleaning Solution', quantity: 10 }
      ],
      createdAt: '2024-01-10'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: ''
  })

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim()) {
      const template: QuoteTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        description: newTemplate.description,
        items: [], // In production, this would come from current quote items
        createdAt: new Date().toISOString().split('T')[0]
      }
      setTemplates(prev => [template, ...prev])
      setNewTemplate({ name: '', description: '' })
      setShowCreateForm(false)
      alert('Template created successfully!')
    }
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleLoadTemplate = (template: QuoteTemplate) => {
    if (onLoadTemplate) {
      onLoadTemplate(template)
    }
    alert(`Template "${template.name}" loaded!`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Quote Templates</h3>
          <p className="text-xs text-gray-600 mt-1">Save and reuse your frequent quotes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm text-gray-600 mb-4">No templates yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => (
            <div
              key={template.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLoadTemplate(template)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Load Template"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{template.items.length} items</span>
                <span>•</span>
                <span>Created {formatDate(template.createdAt)}</span>
                {template.lastUsed && (
                  <>
                    <span>•</span>
                    <span>Last used {formatDate(template.lastUsed)}</span>
                  </>
                )}
              </div>

              {/* Items Preview */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-1">
                  {template.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{item.productName}</span>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{template.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create Quote Template
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Spare Parts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this template"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 This template will save your current quote items. You can load it anytime to quickly create similar quotes.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewTemplate({ name: '', description: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

