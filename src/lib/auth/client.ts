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
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
    verified_at: string | null
    verified_by: string | null
    created_at: string
    updated_at: string
}

export interface EnhancedUser {
    clerkId: string
    userId: string
    email: string | null
    name: string | null
    imageUrl: string | null
    phone?: string | null
    activeProfile: UserProfile | null
    business: Business | null
    userType: UserType
    isVerified: boolean
    hasBusinessProfile: boolean
    // Convenience properties for backward compatibility
    id: string  // Same as clerkId
    firstName: string | null
    lastName: string | null
    unsafeMetadata: {
        accountType?: string
        is_verified?: boolean
    }
}

// Request deduplication - prevent multiple simultaneous calls
let profileFetchPromise: Promise<EnhancedUser | null> | null = null
let profileCache: { data: EnhancedUser | null; timestamp: number } | null = null
const CACHE_DURATION = 60000 // 60 seconds

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
                profileCache = null
                profileFetchPromise = null
                return
            }

            try {
                // Check cache first
                if (profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
                    setEnhancedUser(profileCache.data)
                    setIsLoading(false)
                    return
                }

                // If there's already a request in flight, wait for it
                if (profileFetchPromise) {
                    const data = await profileFetchPromise
                    setEnhancedUser(data)
                    setIsLoading(false)
                    return
                }

                // Create new request
                profileFetchPromise = (async () => {
                    const response = await fetch('/api/auth/profile')
                    if (!response.ok) {
                        throw new Error('Failed to fetch profile')
                    }
                    const data = await response.json()

                    // Update cache
                    profileCache = {
                        data,
                        timestamp: Date.now()
                    }

                    return data
                })()

                const data = await profileFetchPromise
                setEnhancedUser(data)
            } catch (error) {
                console.error('Error loading user profile:', error)
                setEnhancedUser(null)
            } finally {
                profileFetchPromise = null
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

            // Invalidate cache
            profileCache = null
            profileFetchPromise = null

            // Reload profile
            const profileResponse = await fetch('/api/auth/profile')
            const data = await profileResponse.json()

            // Update cache
            profileCache = {
                data,
                timestamp: Date.now()
            }

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

            // Invalidate cache
            profileCache = null
            profileFetchPromise = null

            // Reload profile
            const profileResponse = await fetch('/api/auth/profile')
            const data = await profileResponse.json()

            // Update cache
            profileCache = {
                data,
                timestamp: Date.now()
            }

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

