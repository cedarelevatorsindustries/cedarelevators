// =====================================================
// Quote Management Types (Unified Phase 1 + Legacy Compat)
// =====================================================

export type UserType = 'guest' | 'individual' | 'business' | 'verified'

export type QuoteRequestType = 'general' | 'single' | 'bulk'

export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'expired'

export type QuotePriority = 'low' | 'normal' | 'medium' | 'high' | 'urgent'

export interface QuoteBasketItem {
  id: string
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

export interface QuoteItem {
  id: string
  quote_id: string
  product_id?: string | null
  variant_id?: string | null
  product_name: string
  product_sku?: string | null
  product_thumbnail?: string | null
  variant_title?: string | null
  variant_sku?: string | null
  specifications?: Record<string, any> | null
  quantity: number
  unit_price: number | null
  discount_percentage: number
  discount_amount?: number
  tax_rate?: number
  tax_amount?: number
  total_price: number | null
  line_total?: number | null
  bulk_pricing_requested: boolean
  notes?: string | null
  created_at: string
}

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

export interface QuoteAttachment {
  id: string
  quote_id: string
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_at?: string
  created_at?: string
}

export interface QuoteRevision {
  id: string
  quote_id: string
  revision_number: number
  status: string
  subtotal: number
  discount_total: number
  taxable_amount: number
  tax_rate: number
  tax_total: number
  grand_total: number
  currency: string
  valid_until: string
  terms_and_conditions?: string | null
  customer_message?: string | null
  company_snapshot: Record<string, any>
  customer_snapshot: Record<string, any>
  items_snapshot: any[]
  pdf_storage_bucket: string
  pdf_storage_path: string
  pdf_size_bytes?: number | null
  pdf_sha256?: string | null
  issued_by: string
  issued_by_name?: string | null
  issued_at: string
}

export interface QuoteNotification {
  id: string
  quote_id: string
  revision_number?: number | null
  event_type:
    | 'customer_submission_confirmation'
    | 'admin_new_quote_alert'
    | 'customer_quote_issued'
    | 'customer_quote_rejected'
  recipient_email: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  provider_message_id?: string | null
  last_error?: string | null
  payload?: Record<string, any> | null
  dedupe_key?: string | null
  sent_at?: string | null
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  quote_number: string
  user_id?: string | null
  clerk_user_id?: string
  guest_name?: string | null
  guest_email?: string | null
  guest_phone?: string | null
  requester_name?: string | null
  requester_email?: string | null
  requester_phone?: string | null
  company_name?: string | null
  gst_number?: string | null
  project_name?: string | null
  project_location?: string | null
  request_type?: QuoteRequestType
  currency?: string
  account_type: UserType
  status: QuoteStatus
  priority: QuotePriority
  company_details?: {
    company_name?: string
    gst_number?: string
    pan_number?: string
    contact_name?: string
    contact_phone?: string
  }
  notes?: string | null
  bulk_pricing_requested?: boolean
  template_id?: string
  subtotal: number
  discount_total: number
  overall_discount_type?: 'fixed' | 'percentage'
  overall_discount_value?: number
  taxable_amount?: number
  tax_rate?: number
  tax_enabled?: boolean
  tax_total: number
  estimated_total: number | null
  pricing_visible?: boolean
  admin_notes?: string | null
  admin_response_message?: string | null
  admin_internal_notes?: string | null
  admin_response_at?: string | null
  responded_by?: string | null
  terms_and_conditions?: string | null
  valid_until?: string | null
  converted_order_id?: string | null
  converted_at?: string | null
  approved_by?: string | null
  approved_at?: string | null
  issued_by?: string | null
  issued_at?: string | null
  rejected_by?: string | null
  rejected_at?: string | null
  rejected_reason?: string | null
  reviewing_started_at?: string | null
  reviewing_by?: string | null
  expired_at?: string | null
  current_revision?: number
  latest_pdf_path?: string | null
  created_at: string
  updated_at: string
  items?: QuoteItem[]
  messages?: QuoteMessage[]
  attachments?: QuoteAttachment[]
  revisions?: QuoteRevision[]
  notifications?: QuoteNotification[]
}

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

export type QuoteActionType =
  | 'created'
  | 'opened_for_review'
  | 'status_changed'
  | 'priority_changed'
  | 'pricing_updated'
  | 'item_pricing_updated'
  | 'discount_updated'
  | 'tax_updated'
  | 'internal_note_added'
  | 'issued'
  | 'reissued'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'pdf_generated'
  | 'email_attempted'
  | 'email_sent'
  | 'email_failed'
  | 'customer_viewed'
  | 'customer_pdf_downloaded'
  | 'guest_history_verified'
  | 'message_sent'
  | 'clarification_requested'

export type AdminRole = 'staff' | 'manager' | 'admin' | 'super_admin'

export interface QuoteAuditLog {
  id: string
  quote_id: string
  action_type: QuoteActionType
  actor_type?: 'customer' | 'admin' | 'system' | 'cron'
  old_status?: QuoteStatus | null
  new_status?: QuoteStatus | null
  old_priority?: QuotePriority | null
  new_priority?: QuotePriority | null
  pricing_changed?: boolean
  old_total?: number | null
  new_total?: number | null
  admin_id?: string | null
  admin_clerk_id?: string | null
  admin_name?: string | null
  admin_role?: AdminRole | string | null
  notes?: string | null
  metadata?: Record<string, any> | null
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
