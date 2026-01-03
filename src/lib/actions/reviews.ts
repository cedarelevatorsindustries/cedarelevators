'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from "next/cache"

export interface ReviewData {
    rating: number
    name: string
    comment: string
}

export interface Review {
    id: string
    product_id: string
    user_id?: string
    rating: number
    name: string
    comment: string
    verified_purchase: boolean
    helpful_count: number
    images?: string[]
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

/**
 * Submit a product review
 */
export async function submitReview(
    productId: string,
    data: ReviewData
): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        const supabase = await createClerkSupabaseClient()

        // Validate input
        if (!data.rating || data.rating < 1 || data.rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' }
        }

        if (!data.comment || data.comment.trim().length < 10) {
            return { success: false, error: 'Review must be at least 10 characters' }
        }

        // Check if user has purchased this product (for verified purchase badge)
        let verifiedPurchase = false
        if (userId) {
            const { data: orders } = await supabase
                .from('order_items')
                .select('id, order:orders!inner(clerk_user_id)')
                .eq('product_id', productId)
                .limit(1)

            verifiedPurchase = (orders?.length || 0) > 0
        }

        // Insert review
        const { error } = await supabase
            .from('product_reviews')
            .insert({
                product_id: productId,
                clerk_user_id: userId,
                rating: data.rating,
                reviewer_name: data.name || user?.firstName || 'Anonymous',
                comment: data.comment.trim(),
                verified_purchase: verifiedPurchase,
                helpful_count: 0,
                status: 'pending' // Reviews go to moderation queue
            })

        if (error) {
            console.error('Error submitting review:', error)
            return { success: false, error: 'Failed to submit review' }
        }

        revalidatePath(`/products/${productId}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error in submitReview:', error)
        return { success: false, error: error.message || 'Failed to submit review' }
    }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
    productId: string
): Promise<{ success: boolean; reviews?: Review[]; error?: string }> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', productId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching reviews:', error)
            return { success: false, error: 'Failed to fetch reviews' }
        }

        const reviews: Review[] = (data || []).map(r => ({
            id: r.id,
            product_id: r.product_id,
            user_id: r.clerk_user_id,
            rating: r.rating,
            name: r.reviewer_name,
            comment: r.comment,
            verified_purchase: r.verified_purchase,
            helpful_count: r.helpful_count,
            images: r.images,
            status: r.status,
            created_at: r.created_at
        }))

        return { success: true, reviews }

    } catch (error: any) {
        console.error('Error in getProductReviews:', error)
        return { success: false, error: error.message || 'Failed to fetch reviews' }
    }
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase.rpc('increment_review_helpful', {
            review_id: reviewId
        })

        if (error) {
            // Fallback: manually increment
            const { data: review } = await supabase
                .from('product_reviews')
                .select('helpful_count')
                .eq('id', reviewId)
                .single()

            if (review) {
                await supabase
                    .from('product_reviews')
                    .update({ helpful_count: (review.helpful_count || 0) + 1 })
                    .eq('id', reviewId)
            }
        }

        return { success: true }

    } catch (error: any) {
        console.error('Error in markReviewHelpful:', error)
        return { success: false, error: error.message || 'Failed to update' }
    }
}
