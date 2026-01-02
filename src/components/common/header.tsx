"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Command, Menu } from "lucide-react"
import { GlobalSearch } from "./global-search"
import { useEffect, useState } from "react"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'

interface HeaderProps {
    sidebarCollapsed: boolean
    onToggleSidebar: () => void
    mobileMenuOpen: boolean
    onToggleMobileMenu: () => void
}

export function Header({ sidebarCollapsed, onToggleSidebar, mobileMenuOpen, onToggleMobileMenu }: HeaderProps) {
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        getCurrentAdminAction().then(res => {
            if (res.success) {
                setProfile(res.profile || null)
                setUser(res.user)
            }
        })
    }, [])

    const getInitial = (email: string) => {
        return email?.charAt(0)?.toUpperCase() || 'A'
    }

    const displayName = profile?.display_name || user?.email?.split('@')[0] || "Admin"

    return (
        <header className="px-6 py-4 border-b border-gray-100" suppressHydrationWarning>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg hover:bg-gray-100 lg:hidden"
                        onClick={onToggleMobileMenu}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    {/* Desktop Sidebar Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex h-10 w-10 rounded-lg hover:bg-gray-100"
                        onClick={onToggleSidebar}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="relative w-full max-w-80 justify-start text-sm text-gray-500 h-10 px-4 py-2 bg-gray-50/50 border-gray-200/60 hover:bg-gray-100"
                        onClick={() => {
                            // Trigger the global search by dispatching a keyboard event
                            const event = new KeyboardEvent('keydown', {
                                key: 'j',
                                ctrlKey: true,
                                bubbles: true
                            })
                            document.dispatchEvent(event)
                        }}
                    >
                        <Search className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Search orders, products...</span>
                        <div className="ml-auto hidden sm:flex items-center space-x-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                                <Command className="h-3 w-3" />
                                J
                            </kbd>
                        </div>
                    </Button>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Avatar - clickable to go to profile */}
                    <Button variant="ghost" className="relative h-10 w-auto px-2 rounded-lg hover:bg-gray-100 gap-3" asChild>
                        <Link href="/admin/settings/profile">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{profile ? profile.role.replace('_', ' ') : 'Loading...'}</p>
                            </div>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url || "/avatars/admin.png"} alt={displayName} />
                                <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                                    {getInitial(user?.email || "")}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </Button>
                </div>
            </div>

            <GlobalSearch />
        </header>
    )
}
