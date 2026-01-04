'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, CircleCheck, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validatePasswordStrength } from '@/lib/utils/profile'

interface PasswordSectionProps {
  onUpdate: (currentPassword: string, newPassword: string) => Promise<void>
  className?: string
}

export default function PasswordSection({
  onUpdate,
  className,
}: PasswordSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const passwordStrength = validatePasswordStrength(formData.newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (!passwordStrength.isValid) {
      newErrors.newPassword = 'Password does not meet requirements'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSaving(true)
    try {
      await onUpdate(formData.currentPassword, formData.newPassword)
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setErrors({})
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      setErrors({ currentPassword: 'Current password is incorrect' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setErrors({})
  }

  const getStrengthColor = () => {
    if (!formData.newPassword) return 'bg-gray-200'
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthWidth = () => {
    if (!formData.newPassword) return '0%'
    switch (passwordStrength.strength) {
      case 'weak':
        return '33%'
      case 'medium':
        return '66%'
      case 'strong':
        return '100%'
      default:
        return '0%'
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="current-password">
              Current Password *
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  setErrors({ ...errors, currentPassword: '' })
                }}
                className={cn(
                  'w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle size={14} />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="new-password">
              New Password *
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  setErrors({ ...errors, newPassword: '' })
                }}
                className={cn(
                  'w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={cn(
                    'text-xs font-medium',
                    passwordStrength.strength === 'weak' && 'text-red-600',
                    passwordStrength.strength === 'medium' && 'text-orange-600',
                    passwordStrength.strength === 'strong' && 'text-green-600'
                  )}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-300', getStrengthColor())}
                    style={{ width: getStrengthWidth() }}
                  />
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle size={14} />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirm-password">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  setErrors({ ...errors, confirmPassword: '' })
                }}
                className={cn(
                  'w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle size={14} />
                {errors.confirmPassword}
              </p>
            )}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CircleCheck size={14} />
                Passwords match
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2 mb-2">
              <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-2">Password Requirements:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {passwordStrength.feedback.length > 0 ? (
                    passwordStrength.feedback.map((feedback, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <XCircle size={14} className="text-red-500 flex-shrink-0" />
                        {feedback}
                      </li>
                    ))
                  ) : formData.newPassword ? (
                    <li className="flex items-center gap-2">
                      <CircleCheck size={14} className="text-green-500 flex-shrink-0" />
                      All requirements met
                    </li>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                        Include uppercase and lowercase letters
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                        Include at least one number
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                        Include at least one special character
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 text-sm mb-1">Security Notice</h4>
                <p className="text-sm text-yellow-800">
                  After changing your password, you'll be logged out from all devices. 
                  You'll need to log in again with your new password.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !passwordStrength.isValid || formData.newPassword !== formData.confirmPassword}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

