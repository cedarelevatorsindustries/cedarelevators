'use client'

import { useState } from 'react'
import { Shield, Lock, Eye, EyeOff, Smartphone, Check } from 'lucide-react'

export default function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetup2FA, setShowSetup2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    allowMarketing: false
  })

  const handle2FAToggle = () => {
    if (twoFactorEnabled) {
      if (confirm('Are you sure you want to disable two-factor authentication?')) {
        setTwoFactorEnabled(false)
      }
    } else {
      setShowSetup2FA(true)
    }
  }

  const handleEnable2FA = () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true)
      setShowSetup2FA(false)
      setVerificationCode('')
      alert('Two-factor authentication enabled successfully!')
    } else {
      alert('Please enter a valid 6-digit code')
    }
  }

  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account security and privacy preferences
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Two-Factor Authentication */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={handle2FAToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="ml-14 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Check size={16} />
                <span className="text-sm font-medium">2FA is enabled and protecting your account</span>
              </div>
            </div>
          )}

          {!twoFactorEnabled && (
            <div className="ml-14 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Enable 2FA to secure your account with an additional verification step during login.
              </p>
            </div>
          )}
        </div>

        {/* 2FA Setup Modal */}
        {showSetup2FA && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Enable Two-Factor Authentication
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="w-32 h-32 bg-gray-200 mx-auto mb-3 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">QR Code</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSetup2FA(false)
                    setVerificationCode('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnable2FA}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
              <p className="text-sm text-gray-600">Control what information is visible to others</p>
            </div>
          </div>

          <div className="ml-14 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-600">Who can see your profile</p>
              </div>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="business">Business Only</option>
              </select>
            </div>

            <ToggleItem
              label="Show Email Address"
              description="Display your email on your public profile"
              checked={privacySettings.showEmail}
              onChange={() => handlePrivacyToggle('showEmail')}
            />

            <ToggleItem
              label="Show Phone Number"
              description="Display your phone number on your public profile"
              checked={privacySettings.showPhone}
              onChange={() => handlePrivacyToggle('showPhone')}
            />

            <ToggleItem
              label="Allow Marketing Communications"
              description="Receive personalized offers and recommendations"
              checked={privacySettings.allowMarketing}
              onChange={() => handlePrivacyToggle('allowMarketing')}
            />
          </div>
        </div>

        {/* Password Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Lock className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Password</h3>
              <p className="text-sm text-gray-600">Manage your account password</p>
            </div>
          </div>

          <div className="ml-14">
            <a
              href="/profile/password"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Lock size={16} />
              Change Password
            </a>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => alert('Privacy settings saved!')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save Privacy Settings
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Security Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enable two-factor authentication for maximum security</li>
                <li>• Use a strong, unique password</li>
                <li>• Never share your password with anyone</li>
                <li>• Review your privacy settings regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToggleItemProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

function ToggleItem({ label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
