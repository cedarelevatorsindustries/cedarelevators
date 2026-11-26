export interface QuoteDraftItemMeta {
  product_id: string
  variant_id?: string
  quantity: number
  name: string
  sku?: string
  thumbnail?: string | null
  variant_title?: string | null
  specifications?: Record<string, any> | null
}

export interface StoredQuoteDraft {
  version: 1
  sourceKey: string
  itemsModified: boolean
  name: string
  email: string
  phone: string
  company_name: string
  gst_number: string
  project_name: string
  project_location: string
  notes: string
  items: Array<{
    product_id: string
    variant_id?: string
    quantity: number
  }>
  itemMeta: QuoteDraftItemMeta[]
  updatedAt: string
}

export const QUOTE_DRAFT_STORAGE_KEY = 'cedar_quote_form_draft'

export function readQuoteDraft(): StoredQuoteDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(QUOTE_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredQuoteDraft
    if (!parsed || parsed.version !== 1 || typeof parsed !== 'object') return null
    return {
      version: 1,
      sourceKey: typeof parsed.sourceKey === 'string' ? parsed.sourceKey : 'empty',
      itemsModified: Boolean(parsed.itemsModified),
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      company_name: typeof parsed.company_name === 'string' ? parsed.company_name : '',
      gst_number: typeof parsed.gst_number === 'string' ? parsed.gst_number : '',
      project_name: typeof parsed.project_name === 'string' ? parsed.project_name : '',
      project_location: typeof parsed.project_location === 'string' ? parsed.project_location : '',
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      items: Array.isArray(parsed.items)
        ? parsed.items
            .filter((item) => item && typeof item.product_id === 'string')
            .map((item) => ({
              product_id: item.product_id,
              variant_id: typeof item.variant_id === 'string' ? item.variant_id : '',
              quantity: Math.max(1, Math.min(10000, Number(item.quantity) || 1)),
            }))
        : [],
      itemMeta: Array.isArray(parsed.itemMeta) ? parsed.itemMeta : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveQuoteDraft(draft: StoredQuoteDraft): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore storage quota / privacy mode restrictions cleanly
  }
}

export function clearQuoteDraft(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY)
  } catch {
    // Ignore storage errors cleanly
  }
}
