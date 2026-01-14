'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, CircleCheck, XCircle, AlertCircle, Info, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validatePasswordStrength } from '@/lib/utils/profile'
import { useUser as useClerkUser } from '@clerk/nextjs'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SecuritySection() {
  const { user: clerkUser, isLoaded } = useClerkUser()
  const { signOut } = useClerk()
  const router = useRouter()

  // Password form state
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasPassword, setHasPassword] = useState(true)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const passwordStrength = validatePasswordStrength(formData.newPassword)

  // Check if user has password enabled
  useEffect(() => {
    if (isLoaded && clerkUser) {
      const passwordEnabled = clerkUser.passwordEnabled
      setHasPassword(passwordEnabled)
    }
  }, [isLoaded, clerkUser])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (hasPassword && !formData.currentPassword) {
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
      if (!clerkUser) throw new Error('User not loaded')

      await clerkUser.updatePassword({
        newPassword: formData.newPassword,
        ...(hasPassword && { currentPassword: formData.currentPassword }),
      })

      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})
      setHasPassword(true)
      toast.success(hasPassword ? 'Password updated successfully!' : 'Password set successfully!')
    } catch (error: any) {
      console.error('Error updating password:', error)
      const errorMessage = error.errors?.[0]?.longMessage || error.message

      if (errorMessage?.includes('current password')) {
        setErrors({ currentPassword: 'Current password is incorrect' })
      } else {
        toast.error(errorMessage || 'Failed to update password')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    try {
      // Mark account for deletion in database with 30-day retention
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clerkUser?.id,
          scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule account deletion')
      }

      // Sign out the user
      await signOut()

      toast.success('Account scheduled for deletion. You have 30 days to recover your account.')
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setDeleteConfirmation('')
    }
  }

  const getStrengthColor = () => {
    if (!formData.newPassword) return 'bg-gray-200'
    switch (passwordStrength.strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-200'
    }
  }

  const getStrengthWidth = () => {
    if (!formData.newPassword) return '0%'
    switch (passwordStrength.strength) {
      case 'weak': return '33%'
      case 'medium': return '66%'
      case 'strong': return '100%'
      default: return '0%'
    }
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Password Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {hasPassword ? 'Password Settings' : 'Set Password'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {hasPassword
                  ? 'Update your password to keep your account secure'
                  : 'Set a password to enable email/password login'}
              </p>
            </div>
          </div>
        </div>

        {/* OAuth User Notice */}
        {!hasPassword && (
          <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-1">Google Sign-In Account</h4>
                <p className="text-sm text-blue-800">
                  Your account was created using Google Sign-In. Set a password below to enable email/password login as an alternative.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            {hasPassword && (
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
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="new-password">
                {hasPassword ? 'New Password *' : 'Password *'}
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
                  placeholder={hasPassword ? "Enter new password" : "Create a strong password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength */}
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
                Confirm {hasPassword ? 'New ' : ''}Password *
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
                  placeholder="Confirm password"
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

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !passwordStrength.isValid || formData.newPassword !== formData.confirmPassword}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 2: Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-700 mt-1">
                Irreversible and destructive actions
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-600 mt-1">
                Once you delete your account, it will be scheduled for permanent deletion after 30 days.
                During this period, you can contact support to recover your account.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>30-Day Retention Period:</strong> Your account will be scheduled for deletion.
                  You have 30 days to contact support if you change your mind. After 30 days,
                  your account and all data will be permanently deleted and cannot be recovered.
                </p>
              </div>

              <p className="text-gray-700">
                The following data will be deleted:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Profile information</li>
                <li>Order history</li>
                <li>Addresses</li>
                <li>Saved items and wishlists</li>
                <li>Business verification data</li>
              </ul>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
