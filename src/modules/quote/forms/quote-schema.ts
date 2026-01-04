import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Reusable Item Schema
export const quoteItemSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    variant_id: z.string().optional().nullable(),
    product_name: z.string().optional(), // For UI display only
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

// Helper for file validation
const fileValidation = z.custom<FileList>()
    .refine((files) => !files || files.length === 0 || Array.from(files).every(file => file.size <= MAX_FILE_SIZE), {
        message: `Max file size is 5MB.`
    })
    .refine((files) => !files || files.length === 0 || Array.from(files).every(file => ACCEPTED_FILE_TYPES.includes(file.type)), {
        message: "Only .jpg, .png, .pdf and .doc formats are supported."
    });

// --- GUEST FORM ---
export const guestQuoteSchema = z.object({
    // Guest only adds 1 product at a time
    product_id: z.string().min(1, "Product is required"),
    variant_id: z.string().optional().nullable(),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),

    // Contact Info
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional().or(z.literal('')),

    notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

// --- INDIVIDUAL FORM ---
export const individualQuoteSchema = z.object({
    items: z.array(quoteItemSchema).min(1, "Add at least one item"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),

    // Single attachment allowed
    attachments: fileValidation.optional(), // We'll validate length manually or via refinement if needed
});

// --- BUSINESS (UNVERIFIED) FORM ---
export const businessUnverifiedQuoteSchema = z.object({
    items: z.array(quoteItemSchema).min(1, "Add at least one item"),
    bulk_pricing_requested: z.boolean().default(false),
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),

    // Max 2 attachments
    attachments: fileValidation.optional(),
});

// --- BUSINESS (VERIFIED) FORM ---
export const businessVerifiedQuoteSchema = z.object({
    items: z.array(quoteItemSchema).min(1, "Add at least one item"),
    bulk_pricing_requested: z.boolean().default(false),
    save_as_draft: z.boolean().optional(),
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),

    // Max 5 attachments
    attachments: fileValidation.optional(),
});

export type GuestQuoteValues = z.infer<typeof guestQuoteSchema>;
export type IndividualQuoteValues = z.infer<typeof individualQuoteSchema>;
export type BusinessUnverifiedQuoteValues = z.infer<typeof businessUnverifiedQuoteSchema>;
export type BusinessVerifiedQuoteValues = z.infer<typeof businessVerifiedQuoteSchema>;
