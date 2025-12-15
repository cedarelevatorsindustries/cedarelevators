'use client'

import { LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="mt-6 px-6 pb-6">
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-lg uppercase tracking-wide transition-colors"
      >
        <LogOut className="mr-2" size={20} />
        Logout
      </button>
    </div>
  )
}
