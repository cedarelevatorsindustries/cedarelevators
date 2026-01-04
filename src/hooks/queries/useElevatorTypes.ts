import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchElevatorTypes,
  fetchElevatorTypeById,
  createElevatorType,
  updateElevatorType,
  deleteElevatorType,
  updateElevatorTypesOrder,
  getProductsByElevatorType,
} from '@/lib/actions/elevator-types'
import type { ElevatorTypeFormData, ElevatorTypeFilters } from '@/lib/types/elevator-types'

/**
 * Hook to fetch all elevator types
 */
export function useElevatorTypes(filters?: ElevatorTypeFilters) {
  return useQuery({
    queryKey: ['elevator-types', filters],
    queryFn: () => fetchElevatorTypes(filters),
  })
}

/**
 * Hook to fetch single elevator type by ID
 */
export function useElevatorType(id: string) {
  return useQuery({
    queryKey: ['elevator-types', id],
    queryFn: () => fetchElevatorTypeById(id),
    enabled: !!id,
  })
}

/**
 * Hook to create elevator type
 */
export function useCreateElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: ElevatorTypeFormData) => createElevatorType(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevator-types'] })
    },
  })
}

/**
 * Hook to update elevator type
 */
export function useUpdateElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<ElevatorTypeFormData> }) =>
      updateElevatorType(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['elevator-types'] })
      queryClient.invalidateQueries({ queryKey: ['elevator-types', variables.id] })
    },
  })
}

/**
 * Hook to delete elevator type
 */
export function useDeleteElevatorType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteElevatorType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevator-types'] })
    },
  })
}

/**
 * Hook to update elevator types order
 */
export function useUpdateElevatorTypesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; sort_order: number }>) =>
      updateElevatorTypesOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevator-types'] })
    },
  })
}

/**
 * Hook to fetch products by elevator type
 */
export function useProductsByElevatorType(elevatorTypeId: string) {
  return useQuery({
    queryKey: ['elevator-type-products', elevatorTypeId],
    queryFn: () => getProductsByElevatorType(elevatorTypeId),
    enabled: !!elevatorTypeId,
  })
}

