export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  secondary_email?: string
  phone?: string
  avatar_url?: string
  company_name?: string
  company_role?: string
  verification_status?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  verification_rejected_reason?: string
  display_name?: string
  date_of_birth?: string
  gender?: Gender
  job_title?: string
  department?: string
  created_at: string
  updated_at: string
}

export type AccountType = 'guest' | 'individual' | 'business'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface Address {
  id: string
  user_id: string
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_line_1: string
  address_2?: string
  address_line_2?: string
  city: string
  province: string
  state: string
  postal_code: string
  country_code: string
  country: string
  phone?: string
  is_default: boolean
  is_default_shipping: boolean
  is_default_billing: boolean
  type?: 'home' | 'House' | 'office' | 'warehouse' | 'other'
  address_type?: 'home' | 'office' | 'warehouse' | 'other'
  label?: string
  created_at: string
  updated_at: string
}


export interface NotificationPreferences {
  order_updates_email: boolean
  order_updates_sms: boolean
  order_updates_push: boolean
  quote_responses_email: boolean
  quote_responses_push: boolean
  price_drops_email: boolean
  stock_alerts_email: boolean
  promotions_email: boolean
  newsletters_email: boolean
  account_security_email: boolean
  team_activity_email: boolean
}

