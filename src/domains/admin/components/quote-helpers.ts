import { QuoteStatus } from '@/types/b2b/quote'
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Package,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react'

export function getStatusConfig(status: QuoteStatus | string) {
  switch (status) {
    case 'submitted':
    case 'pending':
      return {
        color: 'bg-orange-50 text-orange-800 border-orange-200',
        icon: Clock,
        label: 'Submitted',
      }
    case 'reviewing':
      return {
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Eye,
        label: 'Under Review',
      }
    case 'quoted':
    case 'approved':
      return {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        label: 'Quoted',
      }
    case 'rejected':
      return {
        color: 'bg-red-50 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Rejected',
      }
    case 'converted':
      return {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: Package,
        label: 'Converted',
      }
    case 'expired':
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
        label: 'Expired',
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
        label: status || 'Unknown',
      }
  }
}

export function deriveEffectiveRequestType(
  requestType?: string | null,
  itemCount?: number
): 'general' | 'single' | 'bulk' {
  if (typeof itemCount === 'number') {
    if (itemCount >= 2) return 'bulk'
    if (itemCount === 1) return 'single'
  }
  if (requestType === 'bulk') return 'bulk'
  if (requestType === 'single') return 'single'
  return 'general'
}

export function getRequestTypeBadge(requestType?: string | null, itemCount?: number) {
  const effective = deriveEffectiveRequestType(requestType, itemCount)
  switch (effective) {
    case 'bulk':
      return {
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        label: 'Multiple Products',
        icon: Layers,
      }
    case 'single':
      return {
        color: 'bg-blue-50 text-blue-800 border-blue-200',
        label: 'Single Product',
        icon: Package,
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'General Enquiry',
        icon: FileText,
      }
  }
}
