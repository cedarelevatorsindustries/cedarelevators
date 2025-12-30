/**
 * CMS Types
 * TypeScript interfaces for CMS content management
 */

export type PolicyType = 'privacy_policy' | 'terms_of_service' | 'return_policy' | 'shipping_policy' | 'refund_policy' | 'warranty_policy' | 'custom'
export type PolicyStatus = 'draft' | 'published'

export interface CMSPolicy {
    id: string
    policy_type: PolicyType
    title: string
    slug: string
    content: string
    status: PolicyStatus
    created_at: string
    updated_at: string
}

export interface CreatePolicyData {
    policy_type: PolicyType
    title: string
    slug?: string
    content: string
    status?: PolicyStatus
}

export interface UpdatePolicyData {
    title?: string
    slug?: string
    content?: string
    status?: PolicyStatus
}
