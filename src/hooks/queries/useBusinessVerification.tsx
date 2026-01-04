'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBusinessProfiles, verifyBusiness } from '@/lib/actions/business'
import { toast } from 'sonner'

export function useBusinessProfiles(filters?: {
  status?: string
  search?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['business-profiles', filters],
    queryFn: async () => {
      const result = await fetchBusinessProfiles(filters)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch business profiles')
      }
      return result.profiles || []
    },
    staleTime: 30000,
  })
}

export function useVerifyBusiness() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      profileId,
      status,
      notes,
    }: {
      profileId: string
      status: 'verified' | 'rejected'
      notes?: string
    }) => {
      const result = await verifyBusiness(profileId, status, notes)
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify business')
      }
      return result
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'verified'
          ? 'Business verified successfully'
          : 'Business verification rejected'
      )
      queryClient.invalidateQueries({ queryKey: ['business-profiles'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify business')
    },
  })
}

