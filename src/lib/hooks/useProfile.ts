"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserProfile, Address, NotificationPreferences } from '@/lib/types/profile'
import { AccountType, ProfileSection } from '@/lib/constants/profile'
import { toast } from 'sonner'

export function useProfile() {
  const { user: clerkUser, isLoaded } = useUser()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accountType, setAccountType] = useState<AccountType>('guest')
  const [isLoading, setIsLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    order_updates_email: true,
    order_updates_sms: false,
    order_updates_push: true,
    quote_responses_email: true,
    quote_responses_push: true,
    price_drops_email: false,
    stock_alerts_email: false,
    promotions_email: false,
    newsletters_email: false,
    account_security_email: true,
    team_activity_email: false,
  })
  const [activeSection, setActiveSection] = useState<ProfileSection>('overview')

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!clerkUser) {
      setAddresses([])
      return
    }

    try {
      const response = await fetch('/api/addresses')
      const data = await response.json()

      if (data.success) {
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }, [clerkUser])

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true)
      return
    }

    if (!clerkUser) {
      setUser(null)
      setAccountType('guest')
      setAddresses([])
      setIsLoading(false)
      return
    }

    // Map Clerk user to UserProfile
    const profileUser: UserProfile = {
      id: clerkUser.id,
      first_name: clerkUser.firstName || '',
      last_name: clerkUser.lastName || '',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      phone: clerkUser.primaryPhoneNumber?.phoneNumber || undefined,
      avatar_url: clerkUser.imageUrl || undefined,
      created_at: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: clerkUser.updatedAt?.toISOString() || new Date().toISOString(),
    }

    // Determine account type from Clerk metadata
    const userType = clerkUser.publicMetadata?.accountType as string ||
      clerkUser.unsafeMetadata?.accountType as string ||
      'individual'

    setUser(profileUser)
    setAccountType(userType as AccountType)
    setIsLoading(false)

    // Fetch addresses
    fetchAddresses()
  }, [clerkUser, isLoaded, fetchAddresses])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!clerkUser) {
      throw new Error('User not authenticated')
    }

    try {
      // Prepare updates for Clerk
      const clerkUpdates: any = {}

      if (updates.first_name !== undefined) {
        clerkUpdates.firstName = updates.first_name
      }

      if (updates.last_name !== undefined) {
        clerkUpdates.lastName = updates.last_name
      }

      // Update Clerk user
      await clerkUser.update(clerkUpdates)

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)

      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    // TODO: Implement avatar upload
    console.log('Uploading avatar:', file)
    return ''
  }

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to add address')
      }

      // Refresh addresses
      await fetchAddresses()
      toast.success('Address added successfully')

      // Trigger navbar refresh
      window.dispatchEvent(new Event('addressUpdated'))
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
      throw error
    }
  }

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update address')
      }

      // Refresh addresses
      await fetchAddresses()
      toast.success('Address updated successfully')

      // Trigger navbar refresh
      window.dispatchEvent(new Event('addressUpdated'))
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Failed to update address')
      throw error
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete address')
      }

      // Refresh addresses
      await fetchAddresses()
      toast.success('Address deleted successfully')

      // Trigger navbar refresh
      window.dispatchEvent(new Event('addressUpdated'))
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
      throw error
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to set default address')
      }

      // Refresh addresses
      await fetchAddresses()
      toast.success('Default address updated')

      // Trigger navbar refresh
      window.dispatchEvent(new Event('addressUpdated'))
    } catch (error) {
      console.error('Error setting default address:', error)
      toast.error('Failed to set default address')
      throw error
    }
  }

  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    // TODO: Implement notification preferences update
    setNotificationPreferences(prev => ({ ...prev, ...preferences }))
  }

  return {
    user,
    accountType,
    isLoading,
    isAuthenticated: !!clerkUser,
    addresses,
    notificationPreferences,
    activeSection,
    setActiveSection,
    updateProfile,
    uploadAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateNotificationPreferences,
  }
}

