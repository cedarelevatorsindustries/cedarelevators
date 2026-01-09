"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface DefaultAddress {
  id: string
  city: string
  postal_code: string
  state: string
  address_line_1: string
}

export function useDefaultAddress() {
  const { isSignedIn } = useUser()
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDefaultAddress = async () => {
    if (!isSignedIn) {
      setDefaultAddress(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/addresses')
      const data = await response.json()

      if (data.success && data.addresses) {
        const defaultAddr = data.addresses.find((addr: any) => addr.is_default)
        setDefaultAddress(defaultAddr || null)
      }
    } catch (error) {
      console.error('Error fetching default address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDefaultAddress()

    // Listen for address updates
    const handleAddressUpdate = () => {
      fetchDefaultAddress()
    }

    window.addEventListener('addressUpdated', handleAddressUpdate)
    return () => window.removeEventListener('addressUpdated', handleAddressUpdate)
  }, [isSignedIn])

  return { defaultAddress, isLoading, refetch: fetchDefaultAddress }
}
