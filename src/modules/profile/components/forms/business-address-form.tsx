'use client'

import { useState } from 'react'
import { CustomSelect } from '@/components/ui/custom-select'

interface BusinessAddressFormProps {
    initialData?: any
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
    isEditing?: boolean
}

export function BusinessAddressForm({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false
}: BusinessAddressFormProps) {
    const [formData, setFormData] = useState({
        address_type: initialData?.address_type || initialData?.type || 'office',
        label: initialData?.label || '',
        company: initialData?.company || '',
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        gst_number: initialData?.gst_number || '',
        address_line_1: initialData?.address_line_1 || '',
        address_line_2: initialData?.address_line_2 || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        postal_code: initialData?.postal_code || '',
        country: initialData?.country || 'India',
        phone: initialData?.phone || '',
        alternative_phone: initialData?.alternative_phone || '',
        is_default: initialData?.is_default || false,
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEditing ? 'Edit Business Address' : 'Add New Business Address'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type *
                    </label>
                    <CustomSelect
                        value={formData.address_type}
                        onChange={(value) => setFormData({ ...formData, address_type: value })}
                        options={[
                            { value: 'home', label: 'Home' },
                            { value: 'office', label: 'Office' },
                            { value: 'warehouse', label: 'Warehouse' },
                            { value: 'other', label: 'Other' }
                        ]}
                        required
                    />
                </div>

                {/* Label */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Main Office, Warehouse 1"
                    />
                </div>

                {/* Company Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Contact Person First Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person First Name *
                    </label>
                    <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Contact Person Last Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person Last Name
                    </label>
                    <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* GST Number */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.gst_number}
                        onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                    />
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                    </label>
                    <input
                        type="text"
                        value={formData.address_line_1}
                        onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address, P.O. box"
                        required
                    />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.address_line_2}
                        onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Building, floor, suite, etc."
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                    </label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Postal Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                    </label>
                    <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Country */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                    </label>
                    <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                        readOnly
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 XXXXX XXXXX"
                        required
                    />
                </div>

                {/* Alternative Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternative Phone (Optional)
                    </label>
                    <input
                        type="tel"
                        value={formData.alternative_phone}
                        onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 XXXXX XXXXX"
                    />
                </div>

                {/* Set as Default */}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_default}
                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Set as default address</span>
                    </label>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 mt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Address' : 'Add Address')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
