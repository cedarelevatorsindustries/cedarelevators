import { z } from 'zod'

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export const quoteItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  variant_id: z.string().optional().nullable(),
  product_name: z.string().optional(),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Maximum quantity per line is 10,000')
    .default(1),
})

export const unifiedQuoteSchema = z
  .object({
    items: z.array(quoteItemSchema).max(100, 'Maximum 100 items per quotation request').default([]),

    // Mandatory contact fields
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(150, 'Email cannot exceed 150 characters'),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone number cannot exceed 20 characters')
      .refine((val) => val.replace(/\D/g, '').length >= 10, {
        message: 'Valid phone number is required (at least 10 digits)',
      }),

    // Conditional company & optional commercial/project fields
    company_name: z
      .string()
      .trim()
      .max(150, 'Company name cannot exceed 150 characters')
      .optional()
      .or(z.literal('')),
    gst_number: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => val === '' || GSTIN_REGEX.test(val), {
        message: 'GST number must be a valid 15-character GSTIN (e.g. 33ABCDE1234F1Z5)',
      })
      .optional()
      .or(z.literal('')),
    project_name: z
      .string()
      .trim()
      .max(150, 'Project name cannot exceed 150 characters')
      .optional()
      .or(z.literal('')),
    project_location: z
      .string()
      .trim()
      .max(150, 'Project location cannot exceed 150 characters')
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .trim()
      .max(2000, 'Additional details cannot exceed 2000 characters')
      .optional()
      .or(z.literal('')),

    // Security / deduplication metadata
    hp_website: z.string().optional(),
    idempotency_key: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    const distinctProducts = new Set(
      (data.items || [])
        .map((item) => item.product_id?.trim())
        .filter((id): id is string => Boolean(id))
    )

    if (distinctProducts.size >= 2) {
      const company = (data.company_name || '').trim()
      if (company.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['company_name'],
          message: 'Company name is required for bulk quotation requests with 2 or more products.',
        })
      }
    }
  })

export type UnifiedQuoteValues = z.infer<typeof unifiedQuoteSchema>

// Compatibility re-exports for any untouched legacy consumers
export const guestQuoteSchema = unifiedQuoteSchema
export const individualQuoteSchema = unifiedQuoteSchema
export const businessUnverifiedQuoteSchema = unifiedQuoteSchema
export const businessVerifiedQuoteSchema = unifiedQuoteSchema

export type GuestQuoteValues = UnifiedQuoteValues
export type IndividualQuoteValues = UnifiedQuoteValues
export type BusinessUnverifiedQuoteValues = UnifiedQuoteValues
export type BusinessVerifiedQuoteValues = UnifiedQuoteValues
