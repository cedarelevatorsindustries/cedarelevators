import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { QuoteForm, type PrefilledQuoteItem } from '@/modules/quote/components/quote-form'

export const metadata: Metadata = {
  title: 'Request a Quote | Cedar Elevators',
  description: 'Request a custom commercial quotation for Cedar Elevators components and project requirements.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewQuotePage(props: PageProps) {
  const searchParams = await props.searchParams
  const supabase = createAdminClient()

  const fromSource = typeof searchParams.from === 'string' ? searchParams.from : undefined
  const productIdParam = typeof searchParams.productId === 'string' ? searchParams.productId.trim() : undefined
  const productIdsParam = typeof searchParams.productIds === 'string' ? searchParams.productIds : undefined
  const variantIdParam = typeof searchParams.variantId === 'string' ? searchParams.variantId.trim() : undefined
  const quantityParam = typeof searchParams.quantity === 'string' ? parseInt(searchParams.quantity, 10) : 1
  const singleQty = !isNaN(quantityParam) && quantityParam >= 1 ? Math.min(10000, quantityParam) : 1

  // Collect desired (productId, variantId?, quantity) pairs
  const requestedItems: Array<{ product_id: string; variant_id?: string | null; quantity: number }> = []

  // 1. If coming from Quote List, read saved guest session wishlist items first (authoritative quantities & variants)
  if (fromSource === 'quote-list') {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('guest_session_id')?.value
    if (sessionId) {
      const { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('session_id', sessionId)
        .eq('is_default', true)
        .maybeSingle()

      if (wishlist?.id) {
        const { data: wishlistItems } = await supabase
          .from('wishlist_items')
          .select('product_id, variant_id, quantity')
          .eq('wishlist_id', wishlist.id)
          .order('created_at', { ascending: false })

        for (const wItem of wishlistItems || []) {
          if (wItem.product_id && UUID_REGEX.test(wItem.product_id)) {
            requestedItems.push({
              product_id: wItem.product_id,
              variant_id:
                wItem.variant_id && wItem.variant_id !== wItem.product_id && UUID_REGEX.test(wItem.variant_id)
                  ? wItem.variant_id
                  : null,
              quantity: Math.max(1, Number(wItem.quantity) || 1),
            })
          }
        }
      }
    }
  }

  // 2. Fallback or explicit productIds comma-separated URL param
  if (requestedItems.length === 0 && productIdsParam) {
    const ids = productIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter((id) => UUID_REGEX.test(id))
    for (const id of Array.from(new Set(ids))) {
      requestedItems.push({ product_id: id, variant_id: null, quantity: 1 })
    }
  }

  // 3. Single product query params from PDP / Product Card
  if (requestedItems.length === 0 && productIdParam && UUID_REGEX.test(productIdParam)) {
    requestedItems.push({
      product_id: productIdParam,
      variant_id:
        variantIdParam && variantIdParam !== productIdParam && UUID_REGEX.test(variantIdParam)
          ? variantIdParam
          : null,
      quantity: singleQty,
    })
  }

  // Hydrate full product & variant metadata from DB
  let initialItems: PrefilledQuoteItem[] = []
  if (requestedItems.length > 0) {
    const pids = Array.from(new Set(requestedItems.map((i) => i.product_id)))
    const vids = Array.from(
      new Set(requestedItems.map((i) => i.variant_id).filter((v): v is string => Boolean(v)))
    )

    const [{ data: products }, { data: variants }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, sku, thumbnail_url, status, specifications, technical_specs')
        .in('id', pids)
        .eq('status', 'active'),
      vids.length > 0
        ? supabase
            .from('product_variants')
            .select('id, product_id, name, sku, variant_title, options, status')
            .in('id', vids)
        : Promise.resolve({ data: [] }),
    ])

    const prodMap = new Map((products || []).map((p: any) => [p.id, p]))
    const varMap = new Map((variants || []).map((v: any) => [v.id, v]))

    initialItems = requestedItems
      .filter((req) => prodMap.has(req.product_id))
      .map((req) => {
        const prod = prodMap.get(req.product_id)
        const variant = req.variant_id ? varMap.get(req.variant_id) : null
        const validVariant =
          variant && variant.product_id === prod.id && variant.status !== 'inactive' ? variant : null

        const variantTitle = validVariant
          ? validVariant.variant_title ||
            (validVariant.options && typeof validVariant.options === 'object'
              ? Object.values(validVariant.options).filter(Boolean).join(' / ')
              : null) ||
            validVariant.name ||
            null
          : null

        const specs =
          (prod.specifications && typeof prod.specifications === 'object' && !Array.isArray(prod.specifications)
            ? prod.specifications
            : null) ||
          (prod.technical_specs && typeof prod.technical_specs === 'object' && !Array.isArray(prod.technical_specs)
            ? prod.technical_specs
            : null)

        return {
          product_id: prod.id,
          variant_id: validVariant?.id || '',
          quantity: req.quantity,
          name: prod.name,
          sku: validVariant?.sku || prod.sku || '',
          thumbnail: prod.thumbnail_url || null,
          variant_title: variantTitle,
          specifications: specs,
        }
      })
  }

  return (
    <QuoteForm initialItems={initialItems} fromQuoteList={fromSource === 'quote-list'} />
  )
}
