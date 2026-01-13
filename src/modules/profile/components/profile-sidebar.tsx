'use client'

import { ProfileSection, AccountType } from '@/lib/constants/profile'
import { getProfileNavigation, getInitials } from '@/lib/utils/profile'
import { UserProfile } from '@/lib/types/profile'
import { useClerk } from '@clerk/nextjs'
import {
  User, LayoutDashboard, Settings, Activity, Building2, Lock, CircleHelp, LogOut,
  House, Mail, Phone, MapPin, Bell, Globe, Shield, MessageSquare, Package,
  FileText, Heart, Copy, Eye, CreditCard, CircleCheck, BarChart3, Key,
  ShieldCheck, Monitor, History, MessageCircle, BookOpen, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ProfileSidebarProps {
  user: UserProfile | null
  accountType: AccountType
  activeSection: ProfileSection
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  onSectionChange: (section: ProfileSection) => void
  className?: string
}

// Map icon names to Lucide components
const iconMap: Record<string, any> = {
  LayoutDashboard,
  User,
  Settings,
  Activity,
  Building2,
  Lock,
  CircleHelp,
  House,
  Mail,
  Phone,
  MapPin,
  Bell,
  Globe,
  Shield,
  MessageSquare,
  Package,
  FileText,
  Heart,
  Copy,
  Eye,
  CreditCard,
  CircleCheck,
  BarChart3,
  Key,
  ShieldCheck,
  Monitor,
  History,
  MessageCircle,
  BookOpen,
  Upload,
}

export default function ProfileSidebar({
  user,
  accountType,
  activeSection,
  verificationStatus = 'incomplete',
  onSectionChange,
  className,
}: ProfileSidebarProps) {
  const { signOut } = useClerk()
  const router = useRouter()
  const navigation = getProfileNavigation(accountType)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getVerificationBadge = () => {
    if (accountType !== 'business') return null

    switch (verificationStatus) {
      case 'approved':
        return <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium whitespace-nowrap">Verified</span>
      case 'pending':
        return <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-medium whitespace-nowrap">Pending</span>
      case 'rejected':
        return <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-medium whitespace-nowrap">Rejected</span>
      default:
        return <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-medium whitespace-nowrap">Required</span>
    }
  }

  return (
    <aside className={cn(
      'w-64 shrink-0 flex flex-col hidden lg:flex',
      'bg-transparent',
      className
    )}>
      {/* User Card - Fixed at top */}
      {user && (
        <div className="p-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={`${user.first_name} ${user.last_name}`}
                width={40}
                height={40}
                className="rounded-full size-10"
              />
            ) : (
              <div className="size-10 rounded-full flex items-center justify-center text-base font-semibold bg-[#1E3A8A] text-white">
                {getInitials(user.first_name, user.last_name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate text-gray-900">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm truncate text-gray-600">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Scrollable */}
      <nav className="px-4 pt-2 flex-1 overflow-y-auto">
        {navigation.map((group, groupIndex) => {
          const GroupIcon = iconMap[group.icon] || User

          return (
            <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3 text-gray-600">
                {group.title}
              </h4>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.section
                  const ItemIcon = iconMap[item.icon] || User



                  return (
                    <button
                      key={item.section}
                      onClick={() => onSectionChange(item.section)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-white text-[#F97316] shadow-sm border border-gray-200'
                          : 'text-gray-700 hover:bg-white/50'
                      )}
                    >
                      <ItemIcon size={20} className="flex-shrink-0" />
                      <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                      {item.badge === 'status' ? getVerificationBadge() : typeof item.badge === 'number' && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom Actions - Fixed at bottom with divider - Only Logout */}
      <div className="flex-shrink-0 border-t border-gray-300 p-4 bg-transparent">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

