import type { Product } from "../types/domain"

export type AvailabilityFilter = "all" | "in_stock" | "out_of_stock"

export type CatalogSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest"

export interface CatalogFilterState {
  availability: AvailabilityFilter
  options: Record<string, string[]>
  categories: string[]
  subcategories: string[]
  applications: string[]
  sort: CatalogSortOption
  q: string
}

export interface ExtractedVariantOptionGroup {
  name: string
  values: Array<{
    value: string
    label: string
    count: number
  }>
}

const VALID_AVAILABILITY = new Set<AvailabilityFilter>(["all", "in_stock", "out_of_stock"])

const SORT_ALIASES: Record<string, CatalogSortOption> = {
  featured: "featured",
  "best-selling": "featured",
  price_asc: "price_asc",
  "price-low-high": "price_asc",
  price_desc: "price_desc",
  "price-high-low": "price_desc",
  name_asc: "name_asc",
  "a-z": "name_asc",
  name_desc: "name_desc",
  "z-a": "name_desc",
  newest: "newest",
  oldest: "oldest",
}

/**
 * Determine whether a product is in stock using verified Cedar Elevators inventory rules:
 * - Products with inventory tracking disabled (`track_inventory === false`) or backorders enabled (`allow_backorders === true`) are treated as in stock.
 * - Products with variants are in stock if any variant has `inventory_quantity > 0` OR product-level `stock_quantity > 0`.
 * - Products without variants are in stock if `stock_quantity > 0` (or `stock_quantity` is null/undefined when untracked).
 */
export function isProductInStock(product: any): boolean {
  if (!product) return false
  if (product.track_inventory === false || product.allow_backorders === true) {
    return true
  }

  const variants = product.variants || product.product_variants || []
  const productStock = Number(product.stock_quantity ?? 0)

  if (Array.isArray(variants) && variants.length > 0) {
    const hasVariantStock = variants.some((v: any) => Number(v?.inventory_quantity ?? 0) > 0)
    return hasVariantStock || productStock > 0
  }

  return productStock > 0
}

/**
 * Normalize option key for display and URL grouping (e.g., "size" -> "Size").
 */
export function normalizeOptionKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return ""
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

/**
 * Normalize specification/option value for canonical comparison:
 * - Trims whitespace and collapses internal spaces
 * - Lowercases
 * - Normalizes whitespace before common unit suffixes (e.g. "10 mm" <-> "10mm", "16 mm" <-> "16mm")
 * Does NOT alter distinct numeric values (e.g. "0.7" vs "0.75" remain distinct).
 */
export function normalizeOptionValue(value: string): string {
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(\d)\s+(mm|cm|m|kg|v|a|hz|w|kw|sq\.?mm)\b/gi, "$1$2")
}

/**
 * Natural numeric-aware comparator for option labels (e.g., 0.5, 0.7, 0.75, 5 mm, 8mm, 10 mm, 16 mm).
 */
function compareOptionLabels(a: string, b: string): number {
  const numA = parseFloat(a)
  const numB = parseFloat(b)
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

/**
 * Extract grouped, deduplicated variant options across a product list.
 * Deduplicates canonical equivalents like "10 mm" and "10mm" under a single clean option.
 */
export function extractVariantOptions(products: Product[]): Record<string, Array<{ value: string; label: string; count: number }>> {
  const groups: Record<string, Map<string, { label: string; productIds: Set<string> }>> = {}

  products.forEach((p: any) => {
    const variants = p?.variants || p?.product_variants || []
    variants.forEach((v: any) => {
      if (!v?.options || typeof v.options !== "object") return
      Object.entries(v.options).forEach(([rawKey, rawVal]) => {
        if (!rawKey || rawVal === null || rawVal === undefined) return
        const strVal = String(rawVal).trim()
        if (!strVal || strVal.toLowerCase() === "default" || strVal.toLowerCase() === "default title") return

        const groupName = normalizeOptionKey(rawKey)
        const canonical = normalizeOptionValue(strVal)
        if (!groupName || !canonical) return

        if (!groups[groupName]) {
          groups[groupName] = new Map()
        }

        const existing = groups[groupName].get(canonical)
        if (!existing) {
          groups[groupName].set(canonical, {
            label: strVal,
            productIds: new Set([p.id]),
          })
        } else {
          existing.productIds.add(p.id)
          // Prefer spaced unit display if available (e.g. "10 mm" over "10mm")
          if (!existing.label.includes(" ") && strVal.includes(" ")) {
            existing.label = strVal
          }
        }
      })
    })
  })

  const result: Record<string, Array<{ value: string; label: string; count: number }>> = {}
  Object.entries(groups).forEach(([groupName, valueMap]) => {
    result[groupName] = Array.from(valueMap.values())
      .map((entry) => ({
        value: entry.label,
        label: entry.label,
        count: entry.productIds.size,
      }))
      .sort((a, b) => compareOptionLabels(a.label, b.label))
  })

  return result
}

/**
 * Split comma-separated and repeated URLSearchParams values cleanly, trimming and deduplicating.
 */
function parseMultiParam(params: URLSearchParams, key: string): string[] {
  const rawValues = params.getAll(key)
  if (rawValues.length === 0) return []
  const seen = new Set<string>()
  const result: string[] = []
  rawValues.forEach((raw) => {
    raw.split(",").forEach((part) => {
      const cleaned = part.trim()
      if (cleaned && !seen.has(cleaned)) {
        seen.add(cleaned)
        result.push(cleaned)
      }
    })
  })
  return result
}

/**
 * Parse unified catalog filter state from URLSearchParams.
 */
export function parseCatalogFiltersFromURL(
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike | null | undefined
): CatalogFilterState {
  const params = searchParams
    ? new URLSearchParams(searchParams.toString())
    : new URLSearchParams()

  const rawAvail = (params.get("availability") || "all").trim() as AvailabilityFilter
  const availability: AvailabilityFilter = VALID_AVAILABILITY.has(rawAvail) ? rawAvail : "all"

  const options: Record<string, string[]> = {}
  params.forEach((_val, key) => {
    if (key.startsWith("option_")) {
      const optionName = normalizeOptionKey(key.slice("option_".length))
      if (optionName) {
        const values = parseMultiParam(params, key)
        if (values.length > 0) {
          options[optionName] = values
        }
      }
    }
  })

  const categories = parseMultiParam(params, "categories")
  const subcategories = parseMultiParam(params, "subcategories")
  const applications = parseMultiParam(params, "applications")

  const rawSort = (params.get("sort") || "featured").trim().toLowerCase()
  const sort: CatalogSortOption = SORT_ALIASES[rawSort] || "featured"

  const q = (params.get("q") || params.get("search") || "").trim()

  return {
    availability,
    options,
    categories,
    subcategories,
    applications,
    sort,
    q,
  }
}

interface ReadonlyURLSearchParamsLike {
  toString(): string
}

/**
 * Build updated URLSearchParams from filter state while preserving context params (type, category, application, collection)
 * and resetting pagination (`page`).
 */
export function buildCatalogFilterSearchParams(
  currentParams: URLSearchParams | ReadonlyURLSearchParamsLike,
  nextFilters: Partial<CatalogFilterState>,
  knownOptionKeys: string[] = []
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString())

  if (nextFilters.availability !== undefined) {
    params.delete("availability")
    if (nextFilters.availability !== "all") {
      params.set("availability", nextFilters.availability)
    }
  }

  if (nextFilters.options !== undefined) {
    // Clear existing option_ params (both known and currently in URL)
    const keysToDelete: string[] = []
    params.forEach((_v, k) => {
      if (k.startsWith("option_")) keysToDelete.push(k)
    })
    knownOptionKeys.forEach((k) => keysToDelete.push(`option_${k}`))
    keysToDelete.forEach((k) => params.delete(k))

    Object.entries(nextFilters.options).forEach(([optName, values]) => {
      const cleaned = values.map((v) => v.trim()).filter(Boolean)
      if (cleaned.length > 0) {
        params.set(`option_${normalizeOptionKey(optName)}`, cleaned.join(","))
      }
    })
  }

  if (nextFilters.categories !== undefined) {
    params.delete("categories")
    if (nextFilters.categories.length > 0) {
      params.set("categories", nextFilters.categories.join(","))
    }
  }

  if (nextFilters.subcategories !== undefined) {
    params.delete("subcategories")
    if (nextFilters.subcategories.length > 0) {
      params.set("subcategories", nextFilters.subcategories.join(","))
    }
  }

  if (nextFilters.applications !== undefined) {
    params.delete("applications")
    if (nextFilters.applications.length > 0) {
      params.set("applications", nextFilters.applications.join(","))
    }
  }

  if (nextFilters.sort !== undefined) {
    params.delete("sort")
    if (nextFilters.sort !== "featured") {
      params.set("sort", nextFilters.sort)
    }
  }

  if (nextFilters.q !== undefined) {
    params.delete("q")
    params.delete("search")
    if (nextFilters.q.trim()) {
      params.set("q", nextFilters.q.trim())
    }
  }

  params.delete("page")
  return params
}

/**
 * Extract effective numeric price for sorting (handles number or {amount} object).
 * Returns null if no positive price is set ("Price on request").
 */
export function getSortablePrice(product: any): number | null {
  const raw = product?.price ?? product?.variants?.[0]?.price ?? product?.product_variants?.[0]?.price
  const num = typeof raw === "object" && raw !== null ? Number(raw.amount) : Number(raw)
  if (Number.isFinite(num) && num > 0) return num
  return null
}

/**
 * Apply all catalog filters and sorting simultaneously:
 * - OR within a single filter group (e.g. Size: 0.5 OR 0.75)
 * - AND across different filter groups (Availability AND Size AND Category AND Application AND Search)
 */
export function applyCatalogFilters(products: Product[], filters: CatalogFilterState): Product[] {
  let result = [...products]

  // 1. Availability filter
  if (filters.availability === "in_stock") {
    result = result.filter((p) => isProductInStock(p))
  } else if (filters.availability === "out_of_stock") {
    result = result.filter((p) => !isProductInStock(p))
  }

  // 2. Variant option / specification filters (AND across option groups, OR within each group)
  const optionEntries = Object.entries(filters.options).filter(([, vals]) => vals.length > 0)
  if (optionEntries.length > 0) {
    result = result.filter((product: any) => {
      const variants = product?.variants || product?.product_variants || []
      if (!Array.isArray(variants) || variants.length === 0) return false

      return optionEntries.every(([optName, selectedValues]) => {
        const normalizedTargets = selectedValues.map((v) => normalizeOptionValue(v))
        return variants.some((v: any) => {
          if (!v?.options || typeof v.options !== "object") return false
          const matchedEntry = Object.entries(v.options).find(
            ([k]) => normalizeOptionKey(k).toLowerCase() === optName.toLowerCase()
          )
          if (!matchedEntry || matchedEntry[1] === null || matchedEntry[1] === undefined) return false
          const normalizedVariantVal = normalizeOptionValue(String(matchedEntry[1]))
          return normalizedTargets.includes(normalizedVariantVal)
        })
      })
    })
  }

  // 3. Sidebar categories filter (matches id, handle, or slug)
  if (filters.categories.length > 0) {
    const targets = new Set(filters.categories.map((c) => c.toLowerCase()))
    result = result.filter((p: any) =>
      p.categories?.some(
        (c: any) =>
          (c?.id && targets.has(String(c.id).toLowerCase())) ||
          (c?.handle && targets.has(String(c.handle).toLowerCase())) ||
          (c?.slug && targets.has(String(c.slug).toLowerCase()))
      )
    )
  }

  // 4. Sidebar subcategories filter
  if (filters.subcategories.length > 0) {
    const targets = new Set(filters.subcategories.map((s) => s.toLowerCase()))
    result = result.filter((p: any) =>
      p.subcategories?.some(
        (s: any) =>
          (s?.id && targets.has(String(s.id).toLowerCase())) ||
          (s?.slug && targets.has(String(s.slug).toLowerCase()))
      ) ||
      p.categories?.some(
        (c: any) =>
          (c?.id && targets.has(String(c.id).toLowerCase())) ||
          (c?.handle && targets.has(String(c.handle).toLowerCase()))
      )
    )
  }

  // 5. Sidebar applications filter
  if (filters.applications.length > 0) {
    const targets = new Set(filters.applications.map((a) => a.toLowerCase()))
    result = result.filter((p: any) =>
      p.applications?.some(
        (a: any) =>
          (a?.id && targets.has(String(a.id).toLowerCase())) ||
          (a?.slug && targets.has(String(a.slug).toLowerCase()))
      ) ||
      p.categories?.some(
        (c: any) =>
          (c?.id && targets.has(String(c.id).toLowerCase())) ||
          (c?.handle && targets.has(String(c.handle).toLowerCase()))
      )
    )
  }

  // 6. Search query filter (title, SKU, description, tags, categories)
  if (filters.q.trim()) {
    const query = filters.q.trim().toLowerCase()
    result = result.filter((p: any) => {
      const titleMatch = (p.title || p.name || "").toLowerCase().includes(query)
      const skuMatch =
        (p.sku || "").toLowerCase().includes(query) ||
        (p.variants || []).some((v: any) => (v.sku || "").toLowerCase().includes(query))
      const descMatch =
        (p.description || "").toLowerCase().includes(query) ||
        (p.short_description || "").toLowerCase().includes(query)
      const catMatch = (p.categories || []).some((c: any) =>
        (c.name || c.title || "").toLowerCase().includes(query)
      )
      const tagMatch = Array.isArray(p.tags)
        ? p.tags.some((t: any) => String(t).toLowerCase().includes(query))
        : false
      return titleMatch || skuMatch || descMatch || catMatch || tagMatch
    })
  }

  // 7. Sorting (null prices always placed after priced items for price sorts)
  switch (filters.sort) {
    case "price_asc":
      result.sort((a, b) => {
        const pa = getSortablePrice(a)
        const pb = getSortablePrice(b)
        if (pa === null && pb === null) return 0
        if (pa === null) return 1
        if (pb === null) return -1
        return pa - pb
      })
      break
    case "price_desc":
      result.sort((a, b) => {
        const pa = getSortablePrice(a)
        const pb = getSortablePrice(b)
        if (pa === null && pb === null) return 0
        if (pa === null) return 1
        if (pb === null) return -1
        return pb - pa
      })
      break
    case "name_asc":
      result.sort((a, b) =>
        (a.title || (a as any).name || "").localeCompare(b.title || (b as any).name || "")
      )
      break
    case "name_desc":
      result.sort((a, b) =>
        (b.title || (b as any).name || "").localeCompare(a.title || (a as any).name || "")
      )
      break
    case "newest":
      result.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      break
    case "oldest":
      result.sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      )
      break
    default:
      break
  }

  return result
}
