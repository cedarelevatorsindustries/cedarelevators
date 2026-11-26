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
  const singleProductParam =
    (typeof searchParams.productId === 'string' ? searchParams.productId.trim() : '') ||
    (typeof searchParams.product === 'string' ? searchParams.product.trim() : '') ||
    undefined
  const productListParam =
    (typeof searchParams.productIds === 'string' ? searchParams.productIds.trim() : '') ||
    (typeof searchParams.products === 'string' ? searchParams.products.trim() : '') ||
    undefined
  const variantIdParam =
    (typeof searchParams.variantId === 'string' ? searchParams.variantId.trim() : '') ||
    (typeof searchParams.variant === 'string' ? searchParams.variant.trim() : '') ||
    undefined
  const quantityParam = typeof searchParams.quantity === 'string' ? parseInt(searchParams.quantity, 10) : 1
  const singleQty = !isNaN(quantityParam) && quantityParam >= 1 ? Math.min(10000, quantityParam) : 1

  // Collect desired (product_id, variant_id?, quantity) pairs
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

  // Track raw identifier entries (can be UUIDs or product handles/slugs)
  const rawTokens: Array<{ token: string; variantId: string | null; quantity: number }> = []

  // 2. Comma-separated productIds / products URL param
  if (requestedItems.length === 0 && productListParam) {
    const tokens = productListParam
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    for (const token of Array.from(new Set(tokens))) {
      rawTokens.push({ token, variantId: null, quantity: 1 })
    }
  }

  // 3. Single product query params from PDP / Product Card / Cedar Collection Enquire (?product=<handle|uuid> or ?productId=<uuid|handle>)
  if (requestedItems.length === 0 && rawTokens.length === 0 && singleProductParam) {
    rawTokens.push({
      token: singleProductParam,
      variantId: variantIdParam && UUID_REGEX.test(variantIdParam) ? variantIdParam : null,
      quantity: singleQty,
    })
  }

  // Resolve UUIDs and handles into canonical product IDs
  const resolvedProductRecords = new Map<string, any>()
  if (rawTokens.length > 0) {
    const uuidTokens = Array.from(new Set(rawTokens.map((t) => t.token).filter((t) => UUID_REGEX.test(t))))
    const handleTokens = Array.from(new Set(rawTokens.map((t) => t.token).filter((t) => !UUID_REGEX.test(t))))

    const [byIdRes, bySlugRes] = await Promise.all([
      uuidTokens.length > 0
        ? supabase
            .from('products')
            .select('id, slug, name, sku, thumbnail_url, status, specifications, technical_specs')
            .in('id', uuidTokens)
            .eq('status', 'active')
        : Promise.resolve({ data: [] }),
      handleTokens.length > 0
        ? supabase
            .from('products')
            .select('id, slug, name, sku, thumbnail_url, status, specifications, technical_specs')
            .in('slug', handleTokens)
            .eq('status', 'active')
        : Promise.resolve({ data: [] }),
    ])

    const byId = new Map((byIdRes.data || []).map((p: any) => [p.id, p]))
    const bySlug = new Map<string, any>()
    for (const p of bySlugRes.data || []) {
      if (p.slug) {
        bySlug.set(p.slug, p)
        bySlug.set(String(p.slug).toLowerCase(), p)
      }
    }

    const seenResolvedIds = new Set<string>()
    for (const entry of rawTokens) {
      const prod = UUID_REGEX.test(entry.token)
        ? byId.get(entry.token)
        : bySlug.get(entry.token) || bySlug.get(entry.token.toLowerCase())
      if (prod && !seenResolvedIds.has(prod.id)) {
        seenResolvedIds.add(prod.id)
        resolvedProductRecords.set(prod.id, prod)
        requestedItems.push({
          product_id: prod.id,
          variant_id: entry.variantId && entry.variantId !== prod.id ? entry.variantId : null,
          quantity: entry.quantity,
        })
      }
    }
  }

  // Hydrate full product & variant metadata from DB
  let initialItems: PrefilledQuoteItem[] = []
  if (requestedItems.length > 0) {
    const missingProductIds = Array.from(
      new Set(requestedItems.map((i) => i.product_id).filter((id) => !resolvedProductRecords.has(id)))
    )
    const vids = Array.from(
      new Set(requestedItems.map((i) => i.variant_id).filter((v): v is string => Boolean(v)))
    )

    const [{ data: extraProducts }, { data: variants }] = await Promise.all([
      missingProductIds.length > 0
        ? supabase
            .from('products')
            .select('id, slug, name, sku, thumbnail_url, status, specifications, technical_specs')
            .in('id', missingProductIds)
            .eq('status', 'active')
        : Promise.resolve({ data: [] }),
      vids.length > 0
        ? supabase
            .from('product_variants')
            .select('id, product_id, name, sku, variant_title, options, status')
            .in('id', vids)
        : Promise.resolve({ data: [] }),
    ])

    for (const p of extraProducts || []) {
      resolvedProductRecords.set(p.id, p)
    }

    const varMap = new Map((variants || []).map((v: any) => [v.id, v]))

    initialItems = requestedItems
      .filter((req) => resolvedProductRecords.has(req.product_id))
      .map((req) => {
        const prod = resolvedProductRecords.get(req.product_id)
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

  const sourceKey =
    fromSource === 'quote-list'
      ? `from=quote-list:${initialItems.map((i) => `${i.product_id}:${i.variant_id || ''}:${i.quantity}`).join(',')}`
      : initialItems.length > 0
        ? initialItems.map((i) => `${i.product_id}:${i.variant_id || ''}:${i.quantity}`).join(',')
        : 'empty'

  return (
    <QuoteForm
      initialItems={initialItems}
      fromQuoteList={fromSource === 'quote-list'}
      sourceKey={sourceKey}
    />
  )
}
