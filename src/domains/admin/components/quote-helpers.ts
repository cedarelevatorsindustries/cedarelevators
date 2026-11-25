import { QuoteStatus } from '@/types/b2b/quote'
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
  BadgeCheck,
  Building2,
  User,
  FileText,
  Layers,
} from 'lucide-react'

export function getStatusConfig(status: QuoteStatus) {
  switch (status) {
    case 'submitted':
    case 'pending':
      return { color: 'bg-orange-50 text-orange-700 border-orange-300', icon: Clock, label: 'Submitted' }
    case 'reviewing':
      return { color: 'bg-blue-50 text-blue-700 border-blue-300', icon: Eye, label: 'Under Review' }
    case 'quoted':
    case 'approved':
      return { color: 'bg-green-50 text-green-700 border-green-300', icon: CheckCircle, label: 'Quoted' }
    case 'rejected':
      return { color: 'bg-red-50 text-red-700 border-red-300', icon: XCircle, label: 'Rejected' }
    case 'converted':
      return { color: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: Package, label: 'Converted' }
    case 'expired':
      return { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: AlertCircle, label: 'Expired' }
    default:
      return { color: 'bg-gray-50 text-gray-700 border-gray-300', icon: AlertCircle, label: status || 'Unknown' }
  }
}

export function getRequestTypeBadge(requestType?: string | null) {
  switch (requestType) {
    case 'bulk':
      return { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Bulk Quote', icon: Layers }
    case 'single':
      return { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Single Product', icon: Package }
    default:
      return { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'General Enquiry', icon: FileText }
  }
}

export function getUserTypeBadge(accountType: string | null) {
  switch (accountType) {
    case 'verified':
      return { color: 'bg-green-50 text-green-700 border-green-200', label: 'Business (Legacy Verified)', icon: BadgeCheck }
    case 'business':
      return { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Business (Legacy)', icon: Building2 }
    case 'individual':
      return { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Individual (Legacy)', icon: User }
    default:
      return { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Guest', icon: User }
  }
}
