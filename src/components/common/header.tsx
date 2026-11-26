"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Command, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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

export function Header({ sidebarCollapsed, onToggleSidebar, onToggleMobileMenu }: HeaderProps) {
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

    const getInitial = (nameOrEmail: string) => {
        return nameOrEmail?.trim()?.charAt(0)?.toUpperCase() || 'A'
    }

    const displayName = profile?.display_name || user?.email?.split('@')[0] || "Admin"
    const roleLabel = profile?.role ? profile.role.replace('_', ' ') : 'Administrator'

    return (
        <header className="px-4 sm:px-6 py-2.5" suppressHydrationWarning>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-[#77736D] hover:text-[#171717] hover:bg-[#F3F2EE] lg:hidden flex-shrink-0 transition-colors cursor-pointer"
                        onClick={onToggleMobileMenu}
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-4 w-4" />
                    </button>

                    {/* Desktop Sidebar Toggle */}
                    <button
                        type="button"
                        className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-[#77736D] hover:text-[#171717] hover:bg-[#F3F2EE] flex-shrink-0 transition-colors cursor-pointer"
                        onClick={onToggleSidebar}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </button>

                    {/* Global Search Trigger */}
                    <button
                        type="button"
                        className="cedar-admin-search-trigger"
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'j',
                                ctrlKey: true,
                                bubbles: true
                            })
                            document.dispatchEvent(event)
                        }}
                    >
                        <Search className="mr-2.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#A09B94" }} />
                        <span className="truncate flex-1">Search quotations, customers, products...</span>
                        <span className="ml-2 hidden sm:inline-flex items-center">
                            <kbd className="cedar-admin-kbd">
                                <Command className="h-2.5 w-2.5" />
                                J
                            </kbd>
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Administrator Profile Identity */}
                    <Link
                        href="/admin/settings/profile"
                        className="inline-flex items-center gap-2.5 h-9 px-2 rounded-[10px] hover:bg-[#F3F2EE] transition-colors"
                    >
                        <div className="text-right hidden md:block">
                            <p
                                className="text-[13px] font-medium leading-none"
                                style={{ color: "#171717" }}
                            >
                                {displayName}
                            </p>
                            <p
                                className="text-[11px] mt-1 capitalize leading-none"
                                style={{ color: "#77736D" }}
                            >
                                {roleLabel}
                            </p>
                        </div>
                        <Avatar className="h-8 w-8" style={{ border: "1px solid #EAE8E2" }}>
                            <AvatarImage
                                src={profile?.avatar_url || "/avatars/admin.png"}
                                alt={displayName}
                            />
                            <AvatarFallback
                                className="text-xs font-medium"
                                style={{ backgroundColor: "#F3F2EE", color: "#171717" }}
                            >
                                {getInitial(profile?.display_name || user?.email || "A")}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>

            <GlobalSearch />
        </header>
    )
}
