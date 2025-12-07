export type QuoteStatus = 'pending' | 'negotiation' | 'revised' | 'accepted' | 'rejected' | 'expired'

export interface QuoteItem {
  id: string
  variant_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  discount_percentage?: number
  total: number
}

export interface QuoteMessage {
  id: string
  quote_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  message: string
  created_at: string
  is_internal: boolean
}

export interface Quote {
  id: string
  quote_number: string
  requested_date: string
  valid_until: string
  status: QuoteStatus
  total: number
  subtotal: number
  discount_total: number
  tax_total: number
  items: QuoteItem[]
  company_name?: string
  customer_name: string
  customer_email: string
  messages?: QuoteMessage[]
  attachments?: Array<{
    id: string
    name: string
    url: string
    size: number
    type: string
  }>
}

export interface QuoteFilters {
  status: QuoteStatus | 'all'
  date_range: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all'
  search: string
}

export interface QuoteStats {
  total_quotes: number
  active_quotes: number
  total_value: number
}
