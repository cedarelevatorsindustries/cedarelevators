'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface CompanyProfile {
  company_name: string
  company_logo?: string
  tax_id: string
  industry: string
  company_size: string
  billing_address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  shipping_address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  contact_email: string
  contact_phone: string
}

interface CompanyInfoSectionProps {
  company: CompanyProfile
  onUpdate: (updates: Partial<CompanyProfile>) => Promise<void>
  onUploadLogo: (file: File) => Promise<string>
  className?: string
}

export default function CompanyInfoSection({
  company,
  onUpdate,
  onUploadLogo,
  className,
}: CompanyInfoSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(company)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(formData)
    } catch (error) {
      console.error('Error saving company profile:', error)
      alert('Failed to save company profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    try {
      await onUploadLogo(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo. Please try again.')
    }
  }

  return (
    <div className={cn('mx-auto max-w-4xl', className)}>
      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-1">
          <p className="text-gray-900 text-3xl font-bold">
            Company Information
          </p>
          <p className="text-gray-600 text-base">
            Manage your company's legal details, addresses, and contact information.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#F97316] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#F97316]/90 disabled:opacity-50"
        >
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-10 pt-8">
        {/* Profile Header */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                {company.company_logo ? (
                  <Image
                    src={company.company_logo}
                    alt={company.company_name}
                    width={96}
                    height={96}
                    className="rounded-lg size-24 flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="size-24 flex-shrink-0 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center text-2xl font-bold">
                    {company.company_name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Edit2 className="text-white" size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-900 text-lg font-bold">Company Logo</p>
                <p className="text-gray-600 text-sm">
                  Upload a JPG, PNG, or SVG. Max size of 5MB.
                </p>
              </div>
            </div>
            <button
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              className="flex h-10 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-200 sm:w-auto"
            >
              <span>Upload Logo</span>
            </button>
          </div>
        </section>

        {/* Company Details Form Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900">
            Company Details
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="legalName">
                Legal Company Name
              </label>
              <input
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                id="legalName"
                type="text"
                placeholder="Enter company name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="taxId">
                Tax ID / GSTIN
              </label>
              <input
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                id="taxId"
                type="text"
                placeholder="Enter Tax ID / GSTIN"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="industry">
                Industry / Type
              </label>
              <select
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 px-4 text-base font-normal leading-normal"
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option>Manufacturing</option>
                <option>Construction</option>
                <option>Real Estate</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="companySize">
                Company Size
              </label>
              <select
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 px-4 text-base font-normal leading-normal"
                id="companySize"
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              >
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
          </div>
        </section>

        {/* Addresses Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900">
            Registered Addresses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Billing Address Card */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Billing Address</h3>
                <button className="text-sm font-bold text-[#1E3A8A] hover:underline">Edit</button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{formData.billing_address.line1}</p>
                {formData.billing_address.line2 && <p>{formData.billing_address.line2}</p>}
                <p>{formData.billing_address.city}, {formData.billing_address.state} {formData.billing_address.postal_code}</p>
                <p>{formData.billing_address.country}</p>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Shipping Address</h3>
                <button className="text-sm font-bold text-[#1E3A8A] hover:underline">Edit</button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{formData.shipping_address.line1}</p>
                {formData.shipping_address.line2 && <p>{formData.shipping_address.line2}</p>}
                <p>{formData.shipping_address.city}, {formData.shipping_address.state} {formData.shipping_address.postal_code}</p>
                <p>{formData.shipping_address.country}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="contactEmail">
                Primary Contact Email
              </label>
              <input
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                id="contactEmail"
                type="email"
                placeholder="contact@company.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900" htmlFor="contactPhone">
                Primary Contact Phone
              </label>
              <input
                className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 border border-gray-300 bg-white focus:border-[#F97316] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                id="contactPhone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

