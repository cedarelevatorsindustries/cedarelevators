'use client'

// =====================================================
// Quote Management Types
// =====================================================

// User Types
export type UserType = 'guest' | 'individual' | 'business' | 'verified'

// Quote Status - Simplified Cedar B2B Workflow
// Flow: pending → reviewing → approved → converted (or rejected at any stage)
export type QuoteStatus =
  | 'pending'      // Initial state when quote is submitted
  | 'reviewing'    // Admin is reviewing and pricing
  | 'approved'     // Quote approved and sent to customer
  | 'rejected'     // Quote rejected (reason required)
  | 'converted'    // Quote converted to order (verified business only)

export type QuotePriority = 'low' | 'medium' | 'high'

// =====================================================
// Quote Basket Types (Client-side)
// =====================================================

export interface QuoteBasketItem {
  id: string // unique basket item id
  product_id: string
  variant_id?: string
  product_name: string
  product_sku?: string
  product_thumbnail?: string
  quantity: number
  unit_price?: number
  bulk_pricing_requested?: boolean
  notes?: string
}

export interface QuoteBasket {
  items: QuoteBasketItem[]
  updated_at: string
}

// =====================================================
// Quote Submission Types
// =====================================================

export interface GuestQuoteSubmission {
  guest_name: string
  guest_email: string
  guest_phone: string
  notes: string // max 200 chars
  items: QuoteBasketItem[]
}

export interface IndividualQuoteSubmission {
  notes: string // max 500 chars
  items: QuoteBasketItem[]
  attachment?: {
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
  }
}

export interface BusinessQuoteSubmission {
  notes: string // max 1000 chars
  items: QuoteBasketItem[]
  company_details: {
    company_name: string
    gst_number?: string
    pan_number?: string
    contact_name?: string
    contact_phone?: string
  }
  attachments?: Array<{
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
  }> // max 2
}

export interface VerifiedQuoteSubmission extends BusinessQuoteSubmission {
  template_id?: string
  attachments?: Array<{
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
  }> // max 5
}

// =====================================================
// Quote Item Types (From Database)
// =====================================================

export interface QuoteItem {
  id: string
  quote_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  product_sku?: string
  product_thumbnail?: string
  quantity: number
  unit_price: number
  discount_percentage: number
  total_price: number
  bulk_pricing_requested: boolean
  notes?: string
  created_at: string
}

// =====================================================
// Quote Message Types
// =====================================================

export interface QuoteMessage {
  id: string
  quote_id: string
  sender_type: 'user' | 'admin'
  sender_id?: string
  sender_name?: string
  message: string
  is_internal: boolean
  read_at?: string
  created_at: string
}

// =====================================================
// Quote Attachment Types
// =====================================================

export interface QuoteAttachment {
  id: string
  quote_id: string
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_at: string
}

// =====================================================
// Quote Template Types
// =====================================================

export interface QuoteTemplate {
  id: string
  clerk_user_id: string
  name: string
  description?: string
  items: QuoteBasketItem[]
  default_notes?: string
  use_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

// =====================================================
// Main Quote Type
// =====================================================

export interface Quote {
  id: string
  quote_number: string
  clerk_user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  user_type: UserType
  status: QuoteStatus
  priority: QuotePriority
  company_details?: {
    company_name?: string
    gst_number?: string
    pan_number?: string
    contact_name?: string
    contact_phone?: string
  }
  notes?: string
  bulk_pricing_requested: boolean
  template_id?: string
  subtotal: number
  discount_total: number
  tax_total: number
  estimated_total: number
  admin_notes?: string
  admin_response_at?: string
  responded_by?: string
  valid_until: string
  converted_order_id?: string
  converted_at?: string
  approved_by?: string
  approved_at?: string
  rejected_reason?: string
  created_at: string
  updated_at: string
  // Relations
  items?: QuoteItem[]
  messages?: QuoteMessage[]
  attachments?: QuoteAttachment[]
}

// =====================================================
// API Response Types
// =====================================================

export interface QuoteFilters {
  status: QuoteStatus | 'all'
  date_range: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all'
  search: string
  user_type?: UserType
}

export interface QuoteStats {
  total_quotes: number
  active_quotes: number
  total_value: number
  pending_count: number
  accepted_count: number
}

export interface QuoteListResponse {
  quotes: Quote[]
  total: number
  page: number
  limit: number
}

// =====================================================
// Quote Audit Log Types
// =====================================================

export type QuoteActionType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'pricing_updated'
  | 'item_pricing_updated'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'message_sent'
  | 'clarification_requested'

export type AdminRole = 'staff' | 'manager' | 'admin' | 'super_admin'

export interface QuoteAuditLog {
  id: string
  quote_id: string
  action_type: QuoteActionType
  old_status?: QuoteStatus
  new_status?: QuoteStatus
  old_priority?: QuotePriority
  new_priority?: QuotePriority
  pricing_changed: boolean
  old_total?: number
  new_total?: number
  admin_clerk_id?: string
  admin_name?: string
  admin_role?: AdminRole
  notes?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AdminUser {
  id: string
  clerk_user_id: string
  email: string
  full_name?: string
  role: AdminRole
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}
