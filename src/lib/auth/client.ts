"use client"

import { useUser as useClerkUser, useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export { useClerk, useSignIn, useSignUp }

export type UserType = "guest" | "individual" | "business" | "verified"

export interface UserProfile {
    id: string
    profile_type: 'individual' | 'business'
    is_active: boolean
}

export interface Business {
    id: string
    name: string
    gst_number: string | null
    pan_number: string | null
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
    verification_documents: any
    verification_requested_at: string | null
    verified_at: string | null
    verified_by: string | null
    verification_notes: string | null
    company_address: string | null
    contact_person: string | null
    contact_phone: string | null
    created_at: string
    updated_at: string
}

export interface EnhancedUser {
    clerkId: string
    userId: string
    email: string | null
    name: string | null
    imageUrl: string | null
    activeProfile: UserProfile | null
    business: Business | null
    userType: UserType
    isVerified: boolean
    hasBusinessProfile: boolean
}

/**
 * Enhanced useUser hook with profile management
 */
export function useUser() {
    const { user: clerkUser, isLoaded } = useClerkUser()
    const router = useRouter()
    const [enhancedUser, setEnhancedUser] = useState<EnhancedUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUserProfile() {
            if (!isLoaded) return

            if (!clerkUser) {
                setEnhancedUser(null)
                setIsLoading(false)
                return
            }

            try {
                // Fetch user profile from API
                const response = await fetch('/api/auth/profile')
                if (!response.ok) {
                    throw new Error('Failed to fetch profile')
                }

                const data = await response.json()
                setEnhancedUser(data)
            } catch (error) {
                console.error('Error loading user profile:', error)
                setEnhancedUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        loadUserProfile()
    }, [clerkUser, isLoaded])

    /**
     * Switch between individual and business profile
     */
    const switchProfile = async (profileType: 'individual' | 'business') => {
        if (!enhancedUser) return

        try {
            const response = await fetch('/api/auth/switch-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileType })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to switch profile')
            }

            // Reload profile
            const profileResponse = await fetch('/api/auth/profile')
            const data = await profileResponse.json()
            setEnhancedUser(data)

            // Refresh the page to update all components
            router.refresh()
        } catch (error: any) {
            console.error('Error switching profile:', error)
            throw error
        }
    }

    /**
     * Create business profile
     */
    const createBusinessProfile = async (businessData: {
        name: string
        gst_number?: string
        pan_number?: string
    }) => {
        if (!enhancedUser) return

        try {
            const response = await fetch('/api/auth/create-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create business profile')
            }

            const result = await response.json()

            // Reload profile
            const profileResponse = await fetch('/api/auth/profile')
            const data = await profileResponse.json()
            setEnhancedUser(data)

            return result
        } catch (error: any) {
            console.error('Error creating business profile:', error)
            throw error
        }
    }

    return {
        user: enhancedUser,
        isLoaded: isLoaded && !isLoading,
        isLoading,
        clerkUser,
        switchProfile,
        createBusinessProfile
    }
}
