/**
 * Standardized Action Result Type
 * Use this for all server actions to ensure consistent response handling in the UI
 */
export interface ActionResult<T = void> {
    success: boolean
    data?: T
    error?: string
    code?: string // Optional error code for client-side translation or distinct handling
    validationErrors?: Record<string, string[]> // Field-level validation errors
}

