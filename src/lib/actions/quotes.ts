'use server'

import { createClerkSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import {
  Quote,
  QuoteFilters,
  QuoteStats,
  QuoteStatus,
  GuestQuoteSubmission,
  IndividualQuoteSubmission,
  BusinessQuoteSubmission,
  VerifiedQuoteSubmission,
  QuoteBasketItem
} from '@/types/b2b/quote'

// =====================================================
// GUEST QUOTE SUBMISSION
// =====================================================

export async function submitGuestQuote(data: GuestQuoteSubmission): Promise<
  | { success: true; quote_number: string }
  | { success: false; error: string }
> {
  try {
    // Use public client for guest quotes (no auth required)
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    // Validate notes length
    if (data.notes && data.notes.length > 200) {
      return { success: false, error: 'Notes must be 200 characters or less' }
    }

    // Validate at least one item
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item is required' }
    }

    // Guest can only have 1 item
    if (data.items.length > 1) {
      return { success: false, error: 'Guests can only quote one item at a time' }
    }

    // Insert quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        user_type: 'guest',
        status: 'pending',
        priority: 'low',
        notes: data.notes,
        clerk_user_id: null
      })
      .select('id, quote_number')
      .single()

    if (quoteError || !quote) {
      console.error('Error creating guest quote:', quoteError)
      return { success: false, error: 'Failed to create quote' }
    }

    // Insert quote items
    const quoteItems = data.items.map(item => ({
      quote_id: quote.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_thumbnail: item.product_thumbnail,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      bulk_pricing_requested: false
    }))

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems)

    if (itemsError) {
      console.error('Error inserting quote items:', itemsError)
      // Quote was created, items failed - still return success but log error
    }

    // TODO: Send email confirmation via Resend
    // TODO: Trigger Pusher notification to admin

    return { success: true, quote_number: quote.quote_number }
  } catch (error: any) {
    console.error('Error in submitGuestQuote:', error)
    return { success: false, error: error.message || 'Failed to submit quote' }
  }
}

// =====================================================
// INDIVIDUAL USER QUOTE SUBMISSION
// =====================================================

export async function submitIndividualQuote(data: IndividualQuoteSubmission): Promise<
  | { success: true; quote_number: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await currentUser()
    const supabase = await createClerkSupabaseClient()

    // Validate notes length
    if (data.notes && data.notes.length > 500) {
      return { success: false, error: 'Notes must be 500 characters or less' }
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item is required' }
    }

    if (data.items.length > 10) {
      return { success: false, error: 'Individual users can quote up to 10 items' }
    }

    // Insert quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        clerk_user_id: userId,
        user_type: 'individual',
        status: 'pending',
        priority: 'low',
        notes: data.notes
      })
      .select('id, quote_number')
      .single()

    if (quoteError || !quote) {
      console.error('Error creating individual quote:', quoteError)
      return { success: false, error: 'Failed to create quote' }
    }

    // Insert quote items
    const quoteItems = data.items.map(item => ({
      quote_id: quote.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_thumbnail: item.product_thumbnail,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      bulk_pricing_requested: item.bulk_pricing_requested || false
    }))

    await supabase.from('quote_items').insert(quoteItems)

    // Insert attachment if provided
    if (data.attachment) {
      await supabase.from('quote_attachments').insert({
        quote_id: quote.id,
        file_name: data.attachment.file_name,
        file_url: data.attachment.file_url,
        file_size: data.attachment.file_size,
        mime_type: data.attachment.mime_type
      })
    }

    // Clear the quote basket
    await supabase
      .from('quote_baskets')
      .update({ items: [], updated_at: new Date().toISOString() })
      .eq('clerk_user_id', userId)

    revalidatePath('/quotes')
    revalidatePath('/request-quote')

    return { success: true, quote_number: quote.quote_number }
  } catch (error: any) {
    console.error('Error in submitIndividualQuote:', error)
    return { success: false, error: error.message || 'Failed to submit quote' }
  }
}

// =====================================================
// BUSINESS USER QUOTE SUBMISSION
// =====================================================

export async function submitBusinessQuote(data: BusinessQuoteSubmission): Promise<
  | { success: true; quote_number: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    // Validate notes length
    if (data.notes && data.notes.length > 1000) {
      return { success: false, error: 'Notes must be 1000 characters or less' }
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item is required' }
    }

    if (data.items.length > 50) {
      return { success: false, error: 'Business users can quote up to 50 items' }
    }

    // Validate attachments
    if (data.attachments && data.attachments.length > 2) {
      return { success: false, error: 'Business users can upload up to 2 attachments' }
    }

    // Check for bulk pricing in any items
    const hasBulkPricing = data.items.some(item => item.bulk_pricing_requested)

    // Insert quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        clerk_user_id: userId,
        user_type: 'business',
        status: 'pending',
        priority: 'medium', // Business users get medium priority
        notes: data.notes,
        company_details: data.company_details,
        bulk_pricing_requested: hasBulkPricing
      })
      .select('id, quote_number')
      .single()

    if (quoteError || !quote) {
      console.error('Error creating business quote:', quoteError)
      return { success: false, error: 'Failed to create quote' }
    }

    // Insert quote items
    const quoteItems = data.items.map(item => ({
      quote_id: quote.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_thumbnail: item.product_thumbnail,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      bulk_pricing_requested: item.bulk_pricing_requested || false
    }))

    await supabase.from('quote_items').insert(quoteItems)

    // Insert attachments
    if (data.attachments && data.attachments.length > 0) {
      const attachments = data.attachments.map(att => ({
        quote_id: quote.id,
        file_name: att.file_name,
        file_url: att.file_url,
        file_size: att.file_size,
        mime_type: att.mime_type
      }))
      await supabase.from('quote_attachments').insert(attachments)
    }

    // Clear the quote basket
    await supabase
      .from('quote_baskets')
      .update({ items: [], updated_at: new Date().toISOString() })
      .eq('clerk_user_id', userId)

    revalidatePath('/quotes')
    revalidatePath('/request-quote')

    return { success: true, quote_number: quote.quote_number }
  } catch (error: any) {
    console.error('Error in submitBusinessQuote:', error)
    return { success: false, error: error.message || 'Failed to submit quote' }
  }
}

// =====================================================
// VERIFIED BUSINESS USER QUOTE SUBMISSION
// =====================================================

export async function submitVerifiedQuote(data: VerifiedQuoteSubmission): Promise<
  | { success: true; quote_number: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    // Validate items (unlimited but warn for performance)
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item is required' }
    }

    // Validate attachments (max 5 for verified)
    if (data.attachments && data.attachments.length > 5) {
      return { success: false, error: 'Verified users can upload up to 5 attachments' }
    }

    const hasBulkPricing = data.items.some(item => item.bulk_pricing_requested)

    // Insert quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        clerk_user_id: userId,
        user_type: 'verified',
        status: 'pending',
        priority: 'high', // Verified users get high priority
        notes: data.notes,
        company_details: data.company_details,
        bulk_pricing_requested: hasBulkPricing,
        template_id: data.template_id
      })
      .select('id, quote_number')
      .single()

    if (quoteError || !quote) {
      console.error('Error creating verified quote:', quoteError)
      return { success: false, error: 'Failed to create quote' }
    }

    // Insert quote items
    const quoteItems = data.items.map(item => ({
      quote_id: quote.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_thumbnail: item.product_thumbnail,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      bulk_pricing_requested: item.bulk_pricing_requested || false
    }))

    await supabase.from('quote_items').insert(quoteItems)

    // Insert attachments
    if (data.attachments && data.attachments.length > 0) {
      const attachments = data.attachments.map(att => ({
        quote_id: quote.id,
        file_name: att.file_name,
        file_url: att.file_url,
        file_size: att.file_size,
        mime_type: att.mime_type
      }))
      await supabase.from('quote_attachments').insert(attachments)
    }

    // Update template usage if used
    if (data.template_id) {
      await supabase
        .from('quote_templates')
        .update({
          use_count: supabase.rpc('increment', { x: 1 }),
          last_used_at: new Date().toISOString()
        })
        .eq('id', data.template_id)
    }

    // Clear the quote basket
    await supabase
      .from('quote_baskets')
      .update({ items: [], updated_at: new Date().toISOString() })
      .eq('clerk_user_id', userId)

    revalidatePath('/quotes')
    revalidatePath('/request-quote')

    return { success: true, quote_number: quote.quote_number }
  } catch (error: any) {
    console.error('Error in submitVerifiedQuote:', error)
    return { success: false, error: error.message || 'Failed to submit quote' }
  }
}

// =====================================================
// FETCH QUOTES
// =====================================================

export async function getQuotes(filters: QuoteFilters): Promise<
  | { success: true; quotes: Quote[] }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    let query = supabase
      .from('quotes')
      .select(`
        *,
        items:quote_items(*),
        messages:quote_messages(*)
      `)
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    // Apply date range filter
    if (filters.date_range && filters.date_range !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.date_range) {
        case 'last_7_days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'last_90_days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte('created_at', startDate.toISOString())
    }

    // Apply search filter
    if (filters.search) {
      query = query.or(`quote_number.ilike.%${filters.search}%`)
    }

    const { data: quotes, error } = await query

    if (error) {
      console.error('Error fetching quotes:', error)
      return { success: false, error: error.message }
    }

    return { success: true, quotes: quotes as Quote[] }
  } catch (error: any) {
    console.error('Error in getQuotes:', error)
    return { success: false, error: error.message || 'Failed to fetch quotes' }
  }
}

// =====================================================
// GET SINGLE QUOTE
// =====================================================

export async function getQuoteByNumber(quoteNumber: string): Promise<
  | { success: true; quote: Quote | null }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        items:quote_items(*),
        messages:quote_messages(*),
        attachments:quote_attachments(*)
      `)
      .eq('quote_number', quoteNumber)
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, quote: null }
      }
      console.error('Error fetching quote:', error)
      return { success: false, error: error.message }
    }

    return { success: true, quote: quote as Quote }
  } catch (error: any) {
    console.error('Error in getQuoteByNumber:', error)
    return { success: false, error: error.message || 'Failed to fetch quote' }
  }
}

export async function getQuoteById(quoteId: string): Promise<
  | { success: true; quote: Quote | null }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        items:quote_items(*),
        messages:quote_messages(*),
        attachments:quote_attachments(*)
      `)
      .eq('id', quoteId)
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, quote: null }
      }
      console.error('Error fetching quote:', error)
      return { success: false, error: error.message }
    }

    return { success: true, quote: quote as Quote }
  } catch (error: any) {
    console.error('Error in getQuoteById:', error)
    return { success: false, error: error.message || 'Failed to fetch quote' }
  }
}

// =====================================================
// QUOTE STATS
// =====================================================

export async function getQuoteStats(): Promise<
  | { success: true; stats: QuoteStats }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('status, estimated_total')
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error fetching quote stats:', error)
      return { success: false, error: error.message }
    }

    const stats: QuoteStats = {
      total_quotes: quotes.length,
      active_quotes: quotes.filter(q => ['pending', 'in_review', 'negotiation'].includes(q.status)).length,
      total_value: quotes.reduce((sum, q) => sum + (q.estimated_total || 0), 0),
      pending_count: quotes.filter(q => q.status === 'pending').length,
      accepted_count: quotes.filter(q => q.status === 'accepted').length
    }

    return { success: true, stats }
  } catch (error: any) {
    console.error('Error in getQuoteStats:', error)
    return { success: false, error: error.message || 'Failed to fetch stats' }
  }
}

// =====================================================
// ADD MESSAGE TO QUOTE
// =====================================================

export async function addQuoteMessage(quoteId: string, message: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await currentUser()
    const supabase = await createClerkSupabaseClient()

    // Verify user owns the quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('id')
      .eq('id', quoteId)
      .eq('clerk_user_id', userId)
      .single()

    if (!quote) {
      return { success: false, error: 'Quote not found' }
    }

    const { error } = await supabase
      .from('quote_messages')
      .insert({
        quote_id: quoteId,
        sender_type: 'user',
        sender_id: userId,
        sender_name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User',
        message,
        is_internal: false
      })

    if (error) {
      console.error('Error adding quote message:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in addQuoteMessage:', error)
    return { success: false, error: error.message || 'Failed to add message' }
  }
}

// =====================================================
// CONVERT QUOTE TO ORDER
// =====================================================

export async function convertQuoteToOrder(quoteId: string): Promise<
  | { success: true; cart_id: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClerkSupabaseClient()

    // Get quote with items
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        items:quote_items(*)
      `)
      .eq('id', quoteId)
      .eq('clerk_user_id', userId)
      .eq('status', 'accepted')
      .single()

    if (quoteError || !quote) {
      return { success: false, error: 'Quote not found or not accepted' }
    }

    // Create cart with quote items
    const cartId = crypto.randomUUID()

    const { error: cartError } = await supabase
      .from('carts')
      .insert({
        id: cartId,
        clerk_user_id: userId,
        currency_code: 'INR'
      })

    if (cartError) {
      console.error('Error creating cart:', cartError)
      return { success: false, error: 'Failed to create cart' }
    }

    // Add items to cart
    const cartItems = quote.items.map((item: any) => ({
      cart_id: cartId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      title: item.product_name,
      thumbnail: item.product_thumbnail,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    await supabase.from('cart_items').insert(cartItems)

    // Update quote status
    await supabase
      .from('quotes')
      .update({
        status: 'converted',
        converted_order_id: cartId
      })
      .eq('id', quoteId)

    revalidatePath('/quotes')
    revalidatePath('/cart')

    return { success: true, cart_id: cartId }
  } catch (error: any) {
    console.error('Error in convertQuoteToOrder:', error)
    return { success: false, error: error.message || 'Failed to convert quote' }
  }
}
