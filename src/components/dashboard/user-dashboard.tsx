"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, CircleCheck, Clock, XCircle } from 'lucide-react'
import VerificationUpload from './verification-upload'

interface Profile {
  id: string
  user_id: string
  email: string
  role: 'individual' | 'business'
  business_name: string | null
  verification_status: 'none' | 'pending' | 'verified' | 'rejected'
  phone: string | null
  created_at: string
  updated_at: string
}

export default function UserDashboard() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const result = await response.json()
      
      if (result.data) {
        setProfile(result.data)
      } else {
        // Create profile if it doesn't exist
        await syncProfile()
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncProfile = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          role: user.publicMetadata?.role || 'individual',
          business_name: user.publicMetadata?.business_name || null,
        }),
      })

      const result = await response.json()
      if (result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Error syncing profile:', error)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>
              You need to be signed in to view your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const getVerificationBadge = () => {
    if (profile?.role !== 'business') return null

    const statusConfig = {
      none: { label: 'Unverified', icon: XCircle, className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Verification Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      verified: { label: 'Verified Business', icon: CircleCheck, className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Verification Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[profile.verification_status]
    const Icon = config.icon

    return (
      <Badge className={config.className} data-testid="verification-status-badge">
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="user-dashboard">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card data-testid="user-info-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome, {user.firstName || 'User'}!</CardTitle>
                <CardDescription>{user.primaryEmailAddress?.emailAddress}</CardDescription>
              </div>
              {getVerificationBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium capitalize" data-testid="account-type">
                  {profile?.role || 'individual'}
                </p>
              </div>
              {profile?.role === 'business' && profile.business_name && (
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium" data-testid="business-name">{profile.business_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Verification Section */}
        {profile?.role === 'business' && (
          <Card data-testid="business-verification-card">
            <CardHeader>
              <CardTitle>Business Verification</CardTitle>
              <CardDescription>
                {profile.verification_status === 'none' && 
                  'Submit verification documents to unlock business features'}
                {profile.verification_status === 'pending' && 
                  'Your documents are under review'}
                {profile.verification_status === 'verified' && 
                  'Your business is verified! Enjoy full access to business features.'}
                {profile.verification_status === 'rejected' && 
                  'Your verification was rejected. Please submit new documents.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(profile.verification_status === 'none' || profile.verification_status === 'rejected') && (
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                  data-testid="submit-verification-button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Verification Documents
                </Button>
              )}

              {profile.verification_status === 'pending' && (
                <div className="flex items-center text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Your documents are being reviewed. This usually takes 1-2 business days.</span>
                </div>
              )}

              {profile.verification_status === 'verified' && (
                <div className="flex items-center text-green-700 bg-green-50 p-4 rounded-lg">
                  <CircleCheck className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Verified Business Badge</p>
                    <p className="text-sm">You have access to all business features and bulk ordering.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Access Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Access Level</CardTitle>
            <CardDescription>Features available to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CircleCheck className="w-5 h-5 text-green-500 mr-2" />
                <span>Browse all products</span>
              </li>
              <li className="flex items-center">
                <CircleCheck className="w-5 h-5 text-green-500 mr-2" />
                <span>Place orders</span>
              </li>
              {profile?.role === 'business' && profile.verification_status === 'verified' && (
                <>
                  <li className="flex items-center">
                    <CircleCheck className="w-5 h-5 text-green-500 mr-2" />
                    <span>Bulk ordering discounts</span>
                  </li>
                  <li className="flex items-center">
                    <CircleCheck className="w-5 h-5 text-green-500 mr-2" />
                    <span>Business invoices with GST</span>
                  </li>
                  <li className="flex items-center">
                    <CircleCheck className="w-5 h-5 text-green-500 mr-2" />
                    <span>Credit terms (Net 30)</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Verification Upload Modal */}
      {showUploadModal && (
        <VerificationUpload
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchProfile()
          }}
        />
      )}
    </div>
  )
}
