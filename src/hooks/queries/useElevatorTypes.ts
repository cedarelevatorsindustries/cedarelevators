import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getElevatorTypes,
  getElevatorTypeById,
  getElevatorTypeBySlug,
  createElevatorType,
  updateElevatorType,
  deleteElevatorType,
  uploadElevatorTypeImage,
  getElevatorTypeStats,
  getProductsForElevatorType
} from '@/lib/actions/elevator-types'
import type { ElevatorTypeFormData } from '@/lib/types/elevator-types'

// Query Keys
const elevatorTypeKeys = {
  all: ['elevatorTypes'] as const,
  lists() {
    return [...this.all, 'list'] as const
  },
  list(filters: any) {
    return [...this.all, 'list', { filters }] as const
  },
  details() {
    return [...this.all, 'detail'] as const
  },
  detail(id: string) {
    return [...this.all, 'detail', id] as const
  },
  stats() {
    return [...this.all, 'stats'] as const
  },
  products(id: string) {
    return [...this.all, 'products', id] as const
  }
}

// =============================================
// QUERIES
// =============================================

export function useElevatorTypes() {
  return useQuery({
    queryKey: elevatorTypeKeys.lists(),
    queryFn: () => getElevatorTypes(),
  })
}

export function useElevatorType(id: string) {
  return useQuery({
    queryKey: elevatorTypeKeys.detail(id),
    queryFn: () => getElevatorTypeById(id),
    enabled: !!id,
  })
}

export function useElevatorTypeBySlug(slug: string) {
  return useQuery({
    queryKey: [...elevatorTypeKeys.all, 'slug', slug] as const,
    queryFn: () => getElevatorTypeBySlug(slug),
    enabled: !!slug,
  })
}

export function useElevatorTypeStats() {
  return useQuery({
    queryKey: elevatorTypeKeys.stats(),
    queryFn: () => getElevatorTypeStats(),
  })
}

// =============================================
// MUTATIONS
// =============================================

export function useCreateElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ElevatorTypeFormData) => createElevatorType(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.lists() })
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.stats() })
        toast.success('Elevator type created successfully')
      } else {
        toast.error(result.error || 'Failed to create elevator type')
      }
    },
    onError: () => {
      toast.error('Failed to create elevator type')
    },
  })
}

export function useUpdateElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ElevatorTypeFormData> }) =>
      updateElevatorType(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.lists() })
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.detail(variables.id) })
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.stats() })
        toast.success('Elevator type updated successfully')
      } else {
        toast.error(result.error || 'Failed to update elevator type')
      }
    },
    onError: () => {
      toast.error('Failed to update elevator type')
    },
  })
}

export function useDeleteElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteElevatorType(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.lists() })
        queryClient.invalidateQueries({ queryKey: elevatorTypeKeys.stats() })
        toast.success('Elevator type deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete elevator type')
      }
    },
    onError: () => {
      toast.error('Failed to delete elevator type')
    },
  })
}

export function useUploadElevatorTypeImage() {
  return useMutation({
    mutationFn: (file: File) => uploadElevatorTypeImage(file),
    onError: () => {
      toast.error('Failed to upload image')
    },
  })
}

export function useElevatorTypeProducts(id: string) {
  return useQuery({
    queryKey: elevatorTypeKeys.products(id),
    queryFn: () => getProductsForElevatorType(id),
    enabled: !!id,
  })
}
