'use client'

import Image from 'next/image'
import { UserProfile } from '@/lib/types/profile'
import { getInitials } from '@/lib/utils/profile'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
  user: UserProfile
  accountType: 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function ProfileHeader({
  user,
  accountType,
  verificationStatus = 'incomplete'
}: ProfileHeaderProps) {
  return (
    <div className="bg-white p-6 flex flex-col items-center justify-center">
      {user.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={`${user.first_name} ${user.last_name}`}
          width={96}
          height={96}
          className="rounded-full mb-4"
        />
      ) : (
        <div className="h-24 w-24 bg-[#1E3A8A] rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-white">
            {getInitials(user.first_name, user.last_name)}
          </span>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {user.first_name} {user.last_name}
      </h2>
      <p className="text-gray-500 text-sm mb-2">{user.email}</p>
      
      {/* Account Type & Verification Status */}
      <div className="flex items-center gap-2 mb-6">
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          accountType === 'business' 
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        )}>
          {accountType === 'business' ? 'Business Account' : 'Individual Account'}
        </span>
        {accountType === 'business' && (
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            verificationStatus === 'approved' && 'bg-green-100 text-green-700',
            verificationStatus === 'pending' && 'bg-orange-100 text-orange-700',
            (verificationStatus === 'incomplete' || verificationStatus === 'rejected') && 'bg-red-100 text-red-700'
          )}>
            {verificationStatus === 'approved' && '✓ Verified'}
            {verificationStatus === 'pending' && 'Pending'}
            {verificationStatus === 'incomplete' && 'Not Verified'}
            {verificationStatus === 'rejected' && 'Rejected'}
          </span>
        )}
      </div>
    </div>
  )
}

