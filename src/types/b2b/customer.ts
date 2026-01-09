'use client'

// =====================================================
// Customer & Verification Types
// =====================================================

// Account Types
export type AccountType = 'individual' | 'business'

// Verification Status
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

// Document Types
export type DocumentType =
  | 'gst_certificate'
  | 'pan_card'
  | 'business_license'
  | 'incorporation_certificate'
  | 'address_proof'
  | 'other'

// Document Status
export type DocumentStatus = 'pending' | 'approved' | 'rejected'

// Company Types
export type CompanyType = 'private_limited' | 'public_limited' | 'partnership' | 'sole_proprietor'

// =====================================================
// Verification Document Interface
// =====================================================

export interface VerificationDocument {
  id: string
  customer_clerk_id: string
  business_profile_id?: string
  document_type: DocumentType
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  status: DocumentStatus
  rejection_reason?: string
  uploaded_at: string
  reviewed_at?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
}

// =====================================================
// Business Profile Interface
// =====================================================

export interface BusinessProfile {
  id: string
  clerk_user_id: string
  company_name: string
  company_type?: CompanyType
  gst_number?: string
  pan_number?: string
  tan_number?: string
  business_address?: {
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  billing_address?: {
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  phone?: string
  website?: string
  annual_revenue?: string
  employee_count?: string
  verification_status: VerificationStatus
  verification_notes?: string
  verified_by?: string
  verified_at?: string
  verification_requested_at?: string
  rejected_at?: string
  last_verification_check_at?: string
  documents_count?: number
  created_at: string
  updated_at: string
}

// =====================================================
// Customer Meta Interface
// =====================================================

export interface CustomerMeta {
  id: string
  clerk_user_id: string
  account_type: AccountType
  business_verified: boolean
  phone?: string
  addresses?: any[]
  preferences?: Record<string, any>
  registration_date: string
  created_at: string
  updated_at: string
}

// =====================================================
// Customer Interface (Complete)
// =====================================================

export type CustomerType = 'lead' | 'customer' | 'business' | 'individual'

export interface Customer {
  id: string
  clerk_user_id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  image_url?: string
  account_type: AccountType
  customer_type?: CustomerType
  business_verified: boolean
  verification_status?: VerificationStatus
  phone?: string
  total_quotes: number
  total_orders: number
  total_spent: number
  average_order_value: number
  last_order_date?: string
  last_activity?: string
  registration_date: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  // Relations
  business_profile?: BusinessProfile
  addresses?: any[]
  orders?: any[]
  quotes?: any[]
  metadata?: Record<string, any>
}

// =====================================================
// Verification Audit Log Interface
// =====================================================

export type VerificationActionType =
  | 'documents_submitted'
  | 'verification_requested'
  | 'document_approved'
  | 'document_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'more_documents_requested'

export interface VerificationAuditLog {
  id: string
  customer_clerk_id: string
  business_profile_id?: string
  action_type: VerificationActionType
  old_status?: VerificationStatus
  new_status?: VerificationStatus
  admin_clerk_id?: string
  admin_name?: string
  admin_role?: string
  notes?: string
  metadata?: Record<string, any>
  created_at: string
}

// =====================================================
// Customer Note Interface
// =====================================================

export interface CustomerNote {
  id: string
  customer_clerk_id: string
  admin_clerk_id: string
  admin_name?: string
  note_text: string
  is_important: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface CustomerFilters {
  account_type?: AccountType | 'all'
  customer_type?: CustomerType | 'all'
  verification_status?: VerificationStatus | 'all'
  has_orders?: boolean
  has_quotes?: boolean
  date_range?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all'
  search?: string
  status?: 'active' | 'inactive' | 'all'
}

export interface CustomerStats {
  total_customers: number
  leads: number
  active_customers: number
  individual_customers: number
  business_customers: number
  verified_businesses: number
  pending_verifications: number
  total_revenue: number
}

export interface CustomerListResponse {
  customers: Customer[]
  total: number
  page: number
  limit: number
}

// =====================================================
// Document Upload Types
// =====================================================

export interface DocumentUploadPayload {
  document_type: DocumentType
  file: File
}

export interface DocumentUploadResponse {
  success: boolean
  document?: VerificationDocument
  error?: string
}

// =====================================================
// Verification Action Types
// =====================================================

export interface ApproveVerificationPayload {
  business_profile_id: string
  notes?: string
}

export interface RejectVerificationPayload {
  business_profile_id: string
  reason: string
}

export interface RequestMoreDocumentsPayload {
  business_profile_id: string
  document_types: DocumentType[]
  message: string
}

export interface ApproveDocumentPayload {
  document_id: string
  notes?: string
}

export interface RejectDocumentPayload {
  document_id: string
  reason: string
}

// =====================================================
// Export Helper Functions Types
// =====================================================

export interface ExportCustomersPayload {
  filters: CustomerFilters
  format: 'csv' | 'xlsx'
}

// =====================================================
// Display Helpers
// =====================================================

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    unverified: 'Unverified',
    pending: 'Pending Review',
    verified: 'Verified',
    rejected: 'Rejected',
  }
  return labels[status]
}

export function getVerificationStatusColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    unverified: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    verified: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status]
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    gst_certificate: 'GST Certificate',
    pan_card: 'PAN Card',
    business_license: 'Business License',
    incorporation_certificate: 'Incorporation Certificate',
    address_proof: 'Address Proof',
    other: 'Other Document',
  }
  return labels[type]
}

export function getDocumentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return labels[status]
}

export function getDocumentStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status]
}

export function getAccountTypeLabel(type: AccountType): string {
  const labels: Record<AccountType, string> = {
    individual: 'Individual',
    business: 'Business',
  }
  return labels[type]
}

export function getCompanyTypeLabel(type: CompanyType): string {
  const labels: Record<CompanyType, string> = {
    private_limited: 'Private Limited',
    public_limited: 'Public Limited',
    partnership: 'Partnership',
    sole_proprietor: 'Sole Proprietor',
  }
  return labels[type]
}

