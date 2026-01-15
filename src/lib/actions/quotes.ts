'use server'

import { createClerkSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { generateQuoteNumber } from '@/lib/utils/quote-number-generator'

interface CreateQuoteInput {
  items: {
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    unit_price?: number;
  }[];
  account_type: 'guest' | 'individual' | 'business';
  status?: string;
  notes?: string;

  // Contact info for ALL users (not just guests)
  name?: string;
  email?: string;
  phone?: string;

  attachments?: {
    file_name: string;
    file_url: string;
    file_size: number;
  }[];
  bulk_pricing_requested?: boolean;
}

export async function createQuote(data: CreateQuoteInput) {
  try {
    const { userId } = await auth();
    const isGuest = !userId;

    if (isGuest && data.account_type !== 'guest') {
      throw new Error("Unauthorized account type for guest");
    }

    const supabase = userId ? await createClerkSupabaseClient() : createServerSupabaseClient();
    if (!supabase) throw new Error("Database connection failed");

    // Generate enterprise-grade quote number
    // Format: CED-QT-{TYPE}-{YYMMDD}-{SEQ}
    const quoteNumber = await generateQuoteNumber(data.account_type);

    // Create Quote
    const quoteData: any = {
      quote_number: quoteNumber,
      user_id: userId || null,
      account_type: data.account_type,
      status: 'reviewing',  // Initial state - database constraint doesn't allow 'pending'
      notes: data.notes,
    };

    // Save contact info for ALL users (using guest_* columns)
    // These columns represent "contact for this quote" and may differ from current profile
    if (data.name) quoteData.guest_name = data.name;
    if (data.email) quoteData.guest_email = data.email;
    if (data.phone) quoteData.guest_phone = data.phone;

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select('id, quote_number')
      .single();

    if (quoteError) {
      console.error("Quote create error:", quoteError);
      throw new Error("Failed to create quote record");
    }

    // 2. Create Items
    if (data.items && data.items.length > 0) {
      const itemsData = data.items.map(item => ({
        quote_id: quote.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsData);

      if (itemsError) throw new Error("Failed to create quote items");
    }

    // 3. Create Attachments
    if (data.attachments && data.attachments.length > 0) {
      const attachData = data.attachments.map(att => ({
        quote_id: quote.id,
        file_name: att.file_name,
        file_url: att.file_url,
        file_size: att.file_size
      }));

      const { error: attachError } = await supabase
        .from('quote_attachments')
        .insert(attachData);

      if (attachError) throw new Error("Failed to save attachments");
    }

    revalidatePath('/quotes');
    return {
      success: true,
      id: quote.id,
      quote_number: quote.quote_number
    };

  } catch (error: any) {
    console.error("createQuote Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuotes(filters: { status?: string } = {}) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const supabase = await createClerkSupabaseClient();

    let query = supabase
      .from('quotes')
      .select(`
        *,
        items:quote_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, quotes: data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getQuoteById(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const supabase = await createClerkSupabaseClient();

    // 1. Fetch quote and items first (safe query)
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select(`
                *,
                items:quote_items(*),
                attachments:quote_attachments(*),
                admin_response:quote_admin_responses(*)
            `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (quoteError) throw quoteError;

    let itemsWithDetails = quoteData.items || [];

    // 2. Extract IDs for fetching details
    const productIds = itemsWithDetails.map((i: any) => i.product_id).filter(Boolean);
    const variantIds = itemsWithDetails.map((i: any) => i.variant_id).filter(Boolean);

    // 3. Fetch products and variants manually if needed
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, images, sku')
        .in('id', productIds);

      const { data: variants } = await supabase
        .from('variants')
        .select('id, title, price, sku')
        .in('id', variantIds);

      // 4. Map details back to items
      const productMap = new Map(products?.map((p: any) => [p.id, p]) || []);
      const variantMap = new Map(variants?.map((v: any) => [v.id, v]) || []);

      itemsWithDetails = itemsWithDetails.map((item: any) => {
        const product = productMap.get(item.product_id);
        const variant = variantMap.get(item.variant_id);

        return {
          ...item,
          product_name: product?.name || 'Product',
          product_image: product?.images?.[0] || null,
          product_thumbnail: product?.images?.[0] || null,
          product_sku: variant?.sku || product?.sku || '',
          variant_title: variant?.title || null
        };
      });
    }

    // 5. Construct final response
    const quote = {
      ...quoteData,
      admin_response: quoteData.admin_response?.[0] || null,
      items: itemsWithDetails
    };

    return { success: true, quote };

  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function convertQuoteToOrder(quoteId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const supabase = await createClerkSupabaseClient();

    // 1. Get Quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', quoteId)
      .eq('user_id', userId)
      .single();

    if (quoteError || !quote) throw new Error("Quote not found");
    if (quote.status !== 'approved') throw new Error("Quote must be approved to convert to order");

    // 2. Get or create cart using the proper cart action
    const { getOrCreateCart } = await import('./cart');

    const cartResult = await getOrCreateCart();

    if (!cartResult.success || !cartResult.data) {
      throw new Error(cartResult.error || "Failed to initialize cart");
    }

    const cartId = cartResult.data.id;

    // 3. Add Items to Cart using the proper action
    if (quote.items && quote.items.length > 0) {
      const { addItemToCart } = await import('./cart');


      for (const item of quote.items) {
        const result = await addItemToCart({
          productId: item.product_id,
          variantId: item.variant_id || undefined,
          quantity: item.quantity
        });

        if (!result.success) {
          throw new Error(`Failed to add item to cart: ${result.error}`);
        }
      }
    }

    // 4. Update Quote Status
    await supabase
      .from('quotes')
      .update({ status: 'converted' })
      .eq('id', quoteId);

    revalidatePath('/quotes');
    return { success: true, cart_id: cartId };

  } catch (e: any) {
    console.error("Convert Error:", e);
    return { success: false, error: e.message };
  }
}

