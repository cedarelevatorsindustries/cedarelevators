'use client'

import { UserProfile } from '@/lib/types/profile'
import {
  FileText, Package, Heart, Clock,
  CircleCheck, AlertCircle, ArrowRight,
  Truck, CircleHelp, MessageCircle, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { getInitials } from '@/lib/utils/profile'
import { Product, ProductCategory, Order } from "@/lib/types/domain"

interface DashboardSectionProps {
  user: UserProfile
  accountType: 'guest' | 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  stats: {
    totalOrders: number
    totalQuotes: number
    activeQuotes: number
    totalSpent: number
    quotesValue: number
    savedItems: number
  }
  recentOrders: Order[]
  recentQuotes: any[]
  recentActivity: any[]
  wishlistItems: any[]
  onSectionChange: (section: string) => void
}

export default function DashboardSection({
  user,
  accountType,
  verificationStatus = 'incomplete',
  stats,
  recentOrders,
  recentQuotes,
  recentActivity,
  wishlistItems,
  onSectionChange,
}: DashboardSectionProps) {
  const isVerified = accountType === 'business' && verificationStatus === 'approved'
  const needsVerification = accountType === 'business' && verificationStatus !== 'approved'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const quickActions = [
    {
      label: 'Request Quote',
      icon: FileText,
      href: '/quotes/request',
      color: 'bg-orange-500 hover:bg-orange-600',
      enabled: isVerified,
    },
    {
      label: 'Bulk Order',
      icon: Package,
      href: '/bulk-order',
      color: 'bg-blue-500 hover:bg-blue-600',
      enabled: isVerified,
    },
    {
      label: `Active Quotes (${stats.activeQuotes})`,
      icon: MessageSquare,
      onClick: () => onSectionChange('quotes'),
      color: 'bg-purple-500 hover:bg-purple-600',
      enabled: true,
    },
    {
      label: 'Track Orders',
      icon: Truck,
      onClick: () => onSectionChange('order_history'),
      color: 'bg-green-500 hover:bg-green-600',
      enabled: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* User Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={`${user.first_name} ${user.last_name}`}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
              {getInitials(user.first_name, user.last_name)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.company_name || `${user.first_name} ${user.last_name}`}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                accountType === 'business'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              )}>
                {accountType === 'business' ? 'Business Account' : 'Individual Account'}
              </span>
              {accountType === 'business' && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  verificationStatus === 'approved' && 'bg-green-100 text-green-700',
                  verificationStatus === 'pending' && 'bg-orange-100 text-orange-700',
                  (verificationStatus === 'incomplete' || verificationStatus === 'rejected') && 'bg-red-100 text-red-700'
                )}>
                  {verificationStatus === 'approved' && '✓ Verified'}
                  {verificationStatus === 'pending' && 'Verification Pending'}
                  {verificationStatus === 'incomplete' && 'Action Required'}
                  {verificationStatus === 'rejected' && 'Verification Rejected'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Banner with Illustration */}
      {needsVerification && (
        <div className={cn(
          'rounded-lg p-6 border',
          verificationStatus === 'pending'
            ? 'bg-orange-50 border-orange-200'
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Illustration */}
            <div className="flex-shrink-0">
              <img
                src="/images/verification/verification_illustration.png"
                alt={verificationStatus === 'pending' ? 'Verification in progress' : 'Action required'}
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              {verificationStatus !== 'pending' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full mb-3">
                  <AlertCircle size={16} />
                  Action Required
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {verificationStatus === 'pending'
                  ? 'Verification in Progress'
                  : 'Complete Business Verification'
                }
              </h3>
              <p className={cn(
                'text-sm mb-4',
                verificationStatus === 'pending' ? 'text-orange-800' : 'text-red-800'
              )}>
                {verificationStatus === 'pending'
                  ? 'Our team is reviewing your documents. You\'ll receive an email once approved (usually within 24 hours).'
                  : 'Complete business verification to unlock quotes & bulk ordering features.'
                }
              </p>
              {verificationStatus !== 'pending' && (
                <button
                  onClick={() => onSectionChange('approvals')}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Complete Verification →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verified Success Banner */}
      {isVerified && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-3">
            <CircleCheck className="text-green-600" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Verified Business Account</h3>
              <p className="text-green-700">You have full access to all B2B features including custom quotes and bulk ordering.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isDisabled = !action.enabled

            const content = (
              <div className={cn(
                'p-6 rounded-lg text-white transition-all',
                isDisabled ? 'bg-gray-300 cursor-not-allowed opacity-60' : action.color,
                !isDisabled && 'hover:shadow-lg transform hover:-translate-y-1'
              )}>
                <Icon size={32} className="mb-3" />
                <h3 className="font-semibold text-lg">{action.label}</h3>
              </div>
            )

            if (isDisabled) {
              return <div key={action.label}>{content}</div>
            }

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}>
                  {content}
                </Link>
              )
            }

            return (
              <button key={action.label} onClick={action.onClick} className="text-left w-full">
                {content}
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => onSectionChange('order_history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      #{order.display_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        order.status === 'completed' && 'bg-green-100 text-green-700',
                        order.status === 'pending' && 'bg-orange-100 text-orange-700',
                        order.status === 'canceled' && 'bg-red-100 text-red-700'
                      )}>
                        {order.status === 'completed' ? 'Delivered' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Reorder
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Quotes */}
      {accountType === 'business' && recentQuotes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Quotes</h2>
            <button
              onClick={() => onSectionChange('quotes')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quote ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentQuotes.slice(0, 5).map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      #{quote.quote_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(quote.requested_date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(quote.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        quote.status === 'accepted' && 'bg-green-100 text-green-700',
                        quote.status === 'pending' && 'bg-orange-100 text-orange-700',
                        quote.status === 'negotiation' && 'bg-blue-100 text-blue-700'
                      )}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status === 'accepted' && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Convert to Order
                          </button>
                        )}
                        {quote.status === 'negotiation' && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Chat
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Saved Items / Wishlist */}
      {wishlistItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Saved Items</h2>
            <button
              onClick={() => onSectionChange('wishlists')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View Full Wishlist <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {wishlistItems.slice(0, 6).map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <Heart className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate mb-2">Product {item.product_id}</p>
                  <button className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                    Add to Quote
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/support"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={18} />
            Contact Support
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CircleHelp size={18} />
            Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}


