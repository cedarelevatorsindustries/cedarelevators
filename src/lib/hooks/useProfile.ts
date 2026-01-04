"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserProfile, Address, NotificationPreferences } from '@/lib/types/profile'
import { AccountType, ProfileSection } from '@/lib/constants/profile'

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

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true)
      return
    }

    if (!clerkUser) {
      setUser(null)
      setAccountType('guest')
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
  }, [clerkUser, isLoaded])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // TODO: Implement profile update
    console.log('Updating profile:', updates)
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    // TODO: Implement avatar upload
    console.log('Uploading avatar:', file)
    return ''
  }

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    // TODO: Implement address addition
    console.log('Adding address:', address)
  }

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    // TODO: Implement address update
    console.log('Updating address:', addressId, updates)
  }

  const deleteAddress = async (addressId: string) => {
    // TODO: Implement address deletion
    console.log('Deleting address:', addressId)
  }

  const setDefaultAddress = async (addressId: string) => {
    // TODO: Implement default address setting
    console.log('Setting default address:', addressId)
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

