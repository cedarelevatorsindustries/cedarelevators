/**
 * Authoritative Integer-Paise Quote Pricing Calculator
 * Avoids IEEE-754 floating-point drift on all line items, discounts, GST, and totals.
 */

export interface PricingItemInput {
  id?: string
  quantity: number
  unit_price: number | null | undefined
  discount_percentage?: number | null | undefined
}

export interface CalculatedLineItem {
  quantity: number
  unit_price: number
  discount_percentage: number
  gross_amount: number
  discount_amount: number
  net_amount: number
}

export interface CalculatedQuoteSummary {
  items: CalculatedLineItem[]
  subtotal: number              // Sum of gross line amounts (before discounts)
  item_discount_total: number   // Sum of item-level discounts
  overall_discount_amount: number
  discount_total: number        // item_discount_total + overall_discount_amount
  taxable_amount: number        // MAX(0, subtotal - discount_total)
  tax_rate: number              // e.g., 18
  tax_total: number
  grand_total: number
}

function toPaise(rupees: number | null | undefined): number {
  const n = Number(rupees || 0)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

function fromPaise(paise: number): number {
  return Math.round(paise) / 100
}

export function calculateQuoteLineItem(input: PricingItemInput): CalculatedLineItem {
  const qty = Math.max(1, Math.floor(Number(input.quantity) || 1))
  const unitPaise = toPaise(input.unit_price)
  const discountPct = Math.min(100, Math.max(0, Number(input.discount_percentage) || 0))

  const grossPaise = unitPaise * qty
  const discountPaise = Math.round((grossPaise * discountPct) / 100)
  const netPaise = Math.max(0, grossPaise - discountPaise)

  return {
    quantity: qty,
    unit_price: fromPaise(unitPaise),
    discount_percentage: Number(discountPct.toFixed(2)),
    gross_amount: fromPaise(grossPaise),
    discount_amount: fromPaise(discountPaise),
    net_amount: fromPaise(netPaise),
  }
}

export function calculateQuoteTotals(params: {
  items: PricingItemInput[]
  overallDiscountType?: 'fixed' | 'percentage'
  overallDiscountValue?: number
  taxEnabled?: boolean
  taxRate?: number
}): CalculatedQuoteSummary {
  const {
    items,
    overallDiscountType = 'fixed',
    overallDiscountValue = 0,
    taxEnabled = true,
    taxRate = 0,
  } = params

  const calculatedItems = items.map(calculateQuoteLineItem)

  let subtotalPaise = 0
  let itemDiscountPaise = 0

  for (const item of calculatedItems) {
    subtotalPaise += toPaise(item.gross_amount)
    itemDiscountPaise += toPaise(item.discount_amount)
  }

  const afterItemDiscountPaise = Math.max(0, subtotalPaise - itemDiscountPaise)

  let overallDiscountPaise = 0
  const safeOverallVal = Math.max(0, Number(overallDiscountValue) || 0)
  if (overallDiscountType === 'percentage') {
    const pct = Math.min(100, safeOverallVal)
    overallDiscountPaise = Math.round((afterItemDiscountPaise * pct) / 100)
  } else {
    overallDiscountPaise = Math.min(afterItemDiscountPaise, toPaise(safeOverallVal))
  }

  const totalDiscountPaise = itemDiscountPaise + overallDiscountPaise
  const taxablePaise = Math.max(0, subtotalPaise - totalDiscountPaise)

  const effectiveTaxRate = taxEnabled ? Math.min(100, Math.max(0, Number(taxRate) || 0)) : 0
  const taxPaise = Math.round((taxablePaise * effectiveTaxRate) / 100)
  const grandTotalPaise = taxablePaise + taxPaise

  return {
    items: calculatedItems,
    subtotal: fromPaise(subtotalPaise),
    item_discount_total: fromPaise(itemDiscountPaise),
    overall_discount_amount: fromPaise(overallDiscountPaise),
    discount_total: fromPaise(totalDiscountPaise),
    taxable_amount: fromPaise(taxablePaise),
    tax_rate: Number(effectiveTaxRate.toFixed(2)),
    tax_total: fromPaise(taxPaise),
    grand_total: fromPaise(grandTotalPaise),
  }
}

export function formatINR(amount: number | null | undefined): string {
  const val = Number(amount || 0)
  return `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPDFCurrency(amount: number | null | undefined): string {
  const val = Number(amount || 0)
  return `Rs. ${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
