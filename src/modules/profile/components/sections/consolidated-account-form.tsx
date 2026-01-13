'use client'

import { useState } from 'react'
import { Camera, Building2, User, Mail, Phone, MapPin, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ConsolidatedAccountFormProps {
    user: any
    companyProfile: any
    onUpdatePersonal: (updates: any) => Promise<void>
    onUpdateCompany: (updates: any) => Promise<void>
    onUploadAvatar: (file: File) => Promise<string>
    onUploadLogo: (file: File) => Promise<string>
}

export default function ConsolidatedAccountForm({
    user,
    companyProfile,
    onUpdatePersonal,
    onUpdateCompany,
    onUploadAvatar,
    onUploadLogo
}: ConsolidatedAccountFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [personalData, setPersonalData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    })

    const [companyData, setCompanyData] = useState({
        company_name: companyProfile?.company_name || '',
        tax_id: companyProfile?.tax_id || '',
        industry: companyProfile?.industry || '',
        company_size: companyProfile?.company_size || '',
        contact_email: companyProfile?.contact_email || '',
        contact_phone: companyProfile?.contact_phone || ''
    })

    const handleSaveChanges = async () => {
        setIsLoading(true)
        try {
            await onUpdatePersonal(personalData)
            if (companyProfile) {
                await onUpdateCompany(companyData)
            }
            // Show success message
        } catch (error) {
            console.error('Error saving changes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Update your photo and personal details here</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Profile Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                                {user?.avatar_url ? (
                                    <Image src={user.avatar_url} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Upload className="w-4 h-4" />
                                    Upload New
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        if (e.target.files?.[0]) onUploadAvatar(e.target.files[0])
                                    }} />
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Upload a new photo. Max size of 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={personalData.first_name}
                                    onChange={(e) => setPersonalData({ ...personalData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={personalData.last_name}
                                    onChange={(e) => setPersonalData({ ...personalData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={personalData.email}
                                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={personalData.phone}
                                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Information Section (Only for Business Users) */}
            {companyProfile && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-orange-600" />
                            Company Information
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Manage your company's legal details, addresses, and contact information.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Company Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200">
                                    {companyProfile?.company_logo ? (
                                        <Image src={companyProfile.company_logo} alt="Company Logo" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Building2 className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <Upload className="w-4 h-4" />
                                        Upload Logo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            if (e.target.files?.[0]) onUploadLogo(e.target.files[0])
                                        }} />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Upload a JPG, PNG, or SVG. Max size of 5MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Company Details */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Legal Company Name</label>
                                    <input
                                        type="text"
                                        value={companyData.company_name}
                                        onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / GSTIN</label>
                                    <input
                                        type="text"
                                        value={companyData.tax_id}
                                        onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                                        placeholder="Enter tax ID / GSTIN"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry / Type</label>
                                    <select
                                        value={companyData.industry}
                                        onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select industry</option>
                                        <option value="construction">Construction</option>
                                        <option value="real-estate">Real Estate</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                                    <select
                                        value={companyData.company_size}
                                        onChange={(e) => setCompanyData({ ...companyData, company_size: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select company size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Email</label>
                                    <input
                                        type="email"
                                        value={companyData.contact_email}
                                        onChange={(e) => setCompanyData({ ...companyData, contact_email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={companyData.contact_phone}
                                        onChange={(e) => setCompanyData({ ...companyData, contact_phone: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>
        </div>
    )
}
