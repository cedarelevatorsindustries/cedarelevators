import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  uploadApplicationImage,
  getApplicationStats
} from '@/lib/actions/applications'
import type { ApplicationFilters, ApplicationFormData } from '@/lib/types/applications'

// Query keys factory
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: ApplicationFilters) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  stats: () => [...applicationKeys.all, 'stats'] as const,
}

// =============================================
// QUERIES
// =============================================

export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => getApplications(filters),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  })
}

export function useApplicationStats() {
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: () => getApplicationStats(),
  })
}

// =============================================
// MUTATIONS
// =============================================

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApplicationFormData) => createApplication(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: applicationKeys.stats() })
        toast.success('Application created successfully')
      } else {
        toast.error(result.error || 'Failed to create application')
      }
    },
    onError: () => {
      toast.error('Failed to create application')
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationFormData> }) =>
      updateApplication(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) })
        queryClient.invalidateQueries({ queryKey: applicationKeys.stats() })
        toast.success('Application updated successfully')
      } else {
        toast.error(result.error || 'Failed to update application')
      }
    },
    onError: () => {
      toast.error('Failed to update application')
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: applicationKeys.stats() })
        toast.success('Application deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete application')
      }
    },
    onError: () => {
      toast.error('Failed to delete application')
    },
  })
}

export function useUploadApplicationImage() {
  return useMutation({
    mutationFn: (file: File) => uploadApplicationImage(file),
    onError: () => {
      toast.error('Failed to upload image')
    },
  })
}

