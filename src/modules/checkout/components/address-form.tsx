"use client"

import { useState } from 'react'
import type { CheckoutAddress } from '../types'

interface AddressFormProps {
  initialData?: Partial<CheckoutAddress>
  onSubmit: (address: CheckoutAddress) => void
  showGSTIN?: boolean
  submitLabel?: string
  isLoading?: boolean
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
]

export default function AddressForm({
  initialData,
  onSubmit,
  showGSTIN = false,
  submitLabel = 'Save Address',
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<CheckoutAddress>>({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    gstin: '',
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.address1?.trim()) newErrors.address1 = 'Address is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.state?.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = 'PIN code is required'
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Enter valid 6-digit PIN code'
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter valid 10-digit mobile number'
    }
    if (showGSTIN && formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Enter valid GSTIN'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData as CheckoutAddress)
    }
  }

  const handleChange = (field: keyof CheckoutAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const inputClass = (field: string) => `
    w-full px-4 py-3 border rounded-lg text-gray-900
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
    ${errors[field] ? 'border-red-500' : 'border-gray-300'}
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={inputClass('firstName')}
            placeholder="John"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={inputClass('lastName')}
            placeholder="Doe"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          className={inputClass('company')}
          placeholder="Your Company Pvt. Ltd."
        />
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
        <input
          type="text"
          value={formData.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          className={inputClass('address1')}
          placeholder="Building, Street, Area"
        />
        {errors.address1 && <p className="mt-1 text-sm text-red-600">{errors.address1}</p>}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2 <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          className={inputClass('address2')}
          placeholder="Landmark, Floor, etc."
        />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClass('city')}
            placeholder="Mumbai"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <select
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={inputClass('state')}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
        </div>
      </div>

      {/* PIN Code & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={inputClass('postalCode')}
            placeholder="400001"
          />
          {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={inputClass('phone')}
            placeholder="9876543210"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      {/* GSTIN */}
      {showGSTIN && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN <span className="text-gray-400">(Optional - for GST invoice)</span>
          </label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
            className={inputClass('gstin')}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
          />
          {errors.gstin && <p className="mt-1 text-sm text-red-600">{errors.gstin}</p>}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold
          hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}

