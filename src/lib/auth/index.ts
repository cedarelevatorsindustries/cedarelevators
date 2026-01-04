// Server exports (for server components/actions)
export {
    getAuthUser,
    getUserType,
    isAuthenticated,
    requireAuth,
    requireBusinessProfile,
    requireVerifiedBusiness,
    getBusinessVerificationStatus,
    getCompanyName,
    hasBusinessProfile,
    type EnhancedAuthUser,
} from "./server"

// Client exports (for client components)
export {
    useUser,
    useClerk,
    useSignIn,
    useSignUp,
    type EnhancedUser,
    type UserProfile,
    type Business,
} from "./client"

// Export UserType from server (single source of truth)
export type { UserType } from "./server"

