export type QuoteStatus = 'draft' | 'pending' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'converted' | 'expired';
export type UserType = 'guest' | 'individual' | 'business';

export interface Quote {
    id: string;
    quote_number?: string;
    user_id: string | null;
    account_type: UserType;
    status: QuoteStatus;
    notes: string | null;
    estimated_total: number | null;
    valid_until?: string;
    converted_order_id?: string;
    converted_at?: string;
    admin_response_message?: string;
    admin_internal_notes?: string;
    created_at: string;
    updated_at: string;

    // Joined data
    items?: QuoteItem[];
    attachments?: QuoteAttachment[];
    admin_response?: QuoteAdminResponse;
}

export interface QuoteItem {
    id: string;
    quote_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number | null;
    created_at: string;

    // UI convenience (joined)
    product_name?: string;
    product_image?: string;
    product_thumbnail?: string;
    product_sku?: string;
}

export interface QuoteAttachment {
    id: string;
    quote_id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    created_at: string;
}

export interface QuoteAdminResponse {
    id: string;
    quote_id: string;
    response_note: string;
    responded_by: string | null;
    responded_at: string;
}
