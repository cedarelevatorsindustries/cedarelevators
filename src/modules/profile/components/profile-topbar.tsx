'use client'

import { Search, Bell, CircleHelp } from 'lucide-react'
import { UserProfile, AccountType } from '@/lib/types/profile'
import { getInitials } from '@/lib/utils/profile'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileTopbarProps {
  user: UserProfile | null
  accountType: AccountType
  className?: string
}

export default function ProfileTopbar({ user, accountType, className }: ProfileTopbarProps) {
  return (
    <header className={cn(
      'h-16 shrink-0 flex items-center justify-between px-4 md:px-6 z-20',
      'bg-transparent',
      className
    )}>
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#1E3A8A] dark:text-blue-300">
            <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor" />
            </svg>
            <h2 className="text-lg font-bold hidden md:block">Cedar Elevators Industries</h2>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 justify-end items-center gap-4">
          {/* Search */}
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] border border-gray-200 dark:border-gray-700 h-10 placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-10 pr-4 text-sm font-normal"
              placeholder="Search products, orders..."
            />
          </div>

          {/* Notifications */}
          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
            <Bell size={20} />
          </button>

          {/* Help */}
          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
            <CircleHelp size={20} />
          </button>

          {/* User Avatar */}
          {user && (
            <Link href="/account/profile">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={40}
                  height={40}
                  className="rounded-full size-10 border-2 border-white dark:border-gray-700"
                />
              ) : (
                <div className="bg-[#1E3A8A] text-white rounded-full size-10 flex items-center justify-center text-sm font-semibold border-2 border-white dark:border-gray-700">
                  {getInitials(user.first_name, user.last_name)}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
