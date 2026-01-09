'use client'

import { useState } from 'react'
import { Address } from '@/lib/types/profile'
import { AccountType } from '@/lib/constants/profile'
import { MapPin, Plus, Edit2, Trash2, Star, House, Building2, Warehouse, MapPinned } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IndividualAddressForm } from '../forms/individual-address-form'
import { BusinessAddressForm } from '../forms/business-address-form'

interface AddressesSectionProps {
  addresses: Address[]
  accountType: AccountType
  onAdd: (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onUpdate: (addressId: string, updates: Partial<Address>) => Promise<void>
  onDelete: (addressId: string) => Promise<void>
  onSetDefault: (addressId: string) => Promise<void>
  className?: string
}

export default function AddressesSection({
  addresses,
  accountType,
  onAdd,
  onUpdate,
  onDelete,
  onSetDefault,
  className,
}: AddressesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
      case 'House':
        return <House size={20} />
      case 'office':
        return <Building2 size={20} />
      case 'warehouse':
        return <Warehouse size={20} />
      default:
        return <MapPinned size={20} />
    }
  }

  const handleSubmit = async (formData: any) => {
    if (editingId) {
      await onUpdate(editingId, formData)
      setEditingId(null)
      setEditingAddress(null)
    } else {
      await onAdd(formData)
      setShowAddForm(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setEditingAddress(null)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setEditingId(address.id)
    setShowAddForm(true)
  }

  const handleDelete = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await onDelete(addressId)
    }
  }

  // Determine which form to use based on account type
  const AddressFormComponent = accountType === 'business' ? BusinessAddressForm : IndividualAddressForm

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your delivery and billing addresses
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddressFormComponent
              initialData={editingAddress}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingId}
            />
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">Add your first address to get started</p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Add Address</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  'p-4 border rounded-lg transition-all',
                  address.is_default
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {/* Address Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {getAddressIcon(address.address_type || address.type || 'home')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {address.label || address.address_type || address.type}
                      </h4>
                      {address.is_default && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Star size={12} fill="currentColor" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {address.first_name} {address.last_name}
                  </p>
                  {address.company && <p className="font-medium text-gray-700">{address.company}</p>}
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                  <p className="pt-2">{address.phone}</p>
                </div>

                {/* Set as Default Button */}
                {!address.is_default && (
                  <button
                    onClick={() => onSetDefault(address.id)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
