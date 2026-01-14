export type ProfileSection =
  | 'overview'
  | 'personal-info'
  | 'addresses'
  | 'notifications'
  | 'change-password'
  | 'wishlists'
  | 'quotes'
  | 'order-history'
  | 'approvals'
  | 'team-management'
  | 'billing'
  | 'api-keys'
  | 'security'
  | 'activity-log'
  | 'business-documents'
  | 'payment-methods'
  | 'invoices'

export const PROFILE_SECTIONS = {
  OVERVIEW: 'overview' as ProfileSection,
  PERSONAL_INFO: 'personal-info' as ProfileSection,
  ADDRESSES: 'addresses' as ProfileSection,
  NOTIFICATIONS: 'notifications' as ProfileSection,
  CHANGE_PASSWORD: 'change-password' as ProfileSection,
  WISHLISTS: 'wishlists' as ProfileSection,
  QUOTES: 'quotes' as ProfileSection,
  ORDER_HISTORY: 'order-history' as ProfileSection,
  APPROVALS: 'approvals' as ProfileSection,
  TEAM_MANAGEMENT: 'team-management' as ProfileSection,
  BILLING: 'billing' as ProfileSection,
  API_KEYS: 'api-keys' as ProfileSection,
  SECURITY: 'security' as ProfileSection,
  ACTIVITY_LOG: 'activity-log' as ProfileSection,
  BUSINESS_DOCUMENTS: 'business-documents' as ProfileSection,
  PAYMENT_METHODS: 'payment-methods' as ProfileSection,
  INVOICES: 'invoices' as ProfileSection,
} as const

export type AccountType = 'guest' | 'individual' | 'business'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface ProfileNavigationItem {
  section: ProfileSection
  label: string
  icon: string
  badge?: number | 'status'
  activeMatch?: string
}

export interface ProfileNavigationGroup {
  title: string
  icon: string
  items: ProfileNavigationItem[]
}

