'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/types/profile'
import { Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getInitials } from '@/lib/utils/profile'
import { Gender } from '@/lib/constants/profile'

interface PersonalInfoSectionProps {
  user: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>
  onUploadAvatar: (file: File) => Promise<string>
  className?: string
}

export default function PersonalInfoSection({
  user,
  onUpdate,
  onUploadAvatar,
  className,
}: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    display_name: user.display_name || '',
    date_of_birth: user.date_of_birth || '',
    gender: user.gender || '',
    job_title: user.job_title || '',
    department: user.department || '',
    phone: user.phone || '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate({
        ...formData,
        gender: formData.gender as Gender | undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      display_name: user.display_name || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      job_title: user.job_title || '',
      department: user.department || '',
      phone: user.phone || '',
    })
    setIsEditing(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    try {
      await onUploadAvatar(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your photo and personal details here
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Profile Header */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={112}
                  height={112}
                  className="rounded-full h-24 w-24 md:h-28 md:w-28"
                />
              ) : (
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-2xl font-semibold">
                  {getInitials(user.first_name, user.last_name)}
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Edit2 className="text-white" size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xl font-bold text-gray-900">Profile Photo</p>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Upload a new photo. Max size of 2MB.
              </p>
            </div>
          </div>
          <button
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-gray-100 text-gray-900 text-sm font-bold w-full md:w-auto hover:bg-gray-200"
          >
            <span className="truncate">Upload New</span>
          </button>
        </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Basic Information */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="first-name">
                  First Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="first-name"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="last-name">
                  Last Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="last-name"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="display-name">
                  Display Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="display-name"
                  type="text"
                  placeholder="Enter display name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gender">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 opacity-60 cursor-not-allowed"
                  disabled
                  id="email"
                  type="email"
                  value={user.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <span className="truncate">Cancel</span>
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              type="submit"
              disabled={isSaving}
            >
              <span className="truncate">{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
