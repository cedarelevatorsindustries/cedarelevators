"use client"

import Link from "next/link"
import NextImage from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { performAdminLogout } from "@/lib/auth/admin-logout"
import { getAdminNewQuotesCount } from "@/lib/actions/admin-quotes/quote-queries"
import { getCurrentAdminAction } from "@/lib/actions/admin-auth"
import type { AdminProfile } from "@/lib/admin-auth-client"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GlobalSearch } from "@/components/common/global-search"
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Layers,
    Image,
    Settings,
    Store,
    LogOut,
    FileText,
    Tag,
    ChevronDown,
    Search,
    Command,
    Menu,
    MoreHorizontal,
    User,
    type LucideIcon
} from "lucide-react"

interface NavItemConfig {
    title: string
    href: string
    icon: LucideIcon
}

const mainNavItems: NavItemConfig[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Quotes",
        href: "/admin/quotes",
        icon: FileText,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
    },
]

const catalogNavItems: NavItemConfig[] = [
    {
        title: "Applications",
        href: "/admin/applications",
        icon: Layers,
    },
    {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
    },
    {
        title: "Elevator Types",
        href: "/admin/elevator-types",
        icon: Tag,
    },
    {
        title: "Collections",
        href: "/admin/collections",
        icon: Store,
    },
]

const otherNavItems: NavItemConfig[] = [
    {
        title: "Banners",
        href: "/admin/banners",
        icon: Image,
    },
]


interface SidebarProps {
    collapsed?: boolean
    onToggleCollapse?: () => void
    onNavigate?: () => void
    showGlobalSearch?: boolean
}

function SidebarNavItem({
    item,
    isActive,
    collapsed,
    newQuotesCount = 0,
    onNavigate,
}: {
    item: NavItemConfig
    isActive: boolean
    collapsed: boolean
    newQuotesCount?: number
    onNavigate?: () => void
}) {
    const showQuoteBadge = item.href === "/admin/quotes" && newQuotesCount > 0

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.title : undefined}
            className={cn(
                "cedar-admin-nav-item group relative",
                collapsed ? "justify-center px-2" : "justify-start px-3",
                isActive && "cedar-admin-nav-item-active"
            )}
        >
            <item.icon
                className="h-4 w-4 flex-shrink-0 transition-colors"
                style={{
                    marginRight: collapsed ? 0 : 10,
                    color: isActive ? "#E85A24" : "#9A958D",
                }}
            />
            {!collapsed && (
                <span className="truncate flex-1 text-left">{item.title}</span>
            )}
            {/* Quote badge — soft pastel circle matching Behalf reference */}
            {!collapsed && showQuoteBadge && (
                <span
                    aria-label={`${newQuotesCount} new quotation submissions`}
                    className="ml-auto flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium leading-none"
                    style={{
                        backgroundColor: "#FCE7D6",
                        color: "#9C4C1D",
                    }}
                >
                    {newQuotesCount}
                </span>
            )}
            {/* Collapsed: small soft dot */}
            {collapsed && showQuoteBadge && (
                <span
                    aria-label={`${newQuotesCount} new quotation submissions`}
                    className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                    style={{
                        backgroundColor: "#E85A24",
                        boxShadow: "0 0 0 2px #F5F4F2",
                    }}
                />
            )}
        </Link>
    )
}

export function Sidebar({
    collapsed = false,
    onToggleCollapse,
    onNavigate,
    showGlobalSearch = true,
}: SidebarProps) {
    const pathname = usePathname()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [catalogExpanded, setCatalogExpanded] = useState(true)
    const [otherExpanded, setOtherExpanded] = useState(true)
    const [newQuotesCount, setNewQuotesCount] = useState(0)
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [user, setUser] = useState<any>(null)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let active = true
        getAdminNewQuotesCount().then((res) => {
            if (active && res.success) {
                setNewQuotesCount(res.count)
            }
        })
        return () => {
            active = false
        }
    }, [pathname])

    useEffect(() => {
        let active = true
        getCurrentAdminAction().then((res) => {
            if (active && res.success) {
                setProfile(res.profile || null)
                setUser(res.user)
            }
        })
        return () => {
            active = false
        }
    }, [])

    // Close profile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false)
            }
        }
        if (profileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [profileMenuOpen])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        setProfileMenuOpen(false)
        await performAdminLogout()
    }

    const triggerGlobalSearch = () => {
        const event = new KeyboardEvent("keydown", {
            key: "j",
            ctrlKey: true,
            bubbles: true,
        })
        document.dispatchEvent(event)
    }

    const isRouteActive = (href: string) =>
        pathname === href || (href !== "/admin" && pathname.startsWith(href))

    const getInitial = (nameOrEmail: string) => {
        return nameOrEmail?.trim()?.charAt(0)?.toUpperCase() || "A"
    }

    const displayName = profile?.display_name || user?.email?.split("@")[0] || "Admin"
    const roleLabel = profile?.role ? profile.role.replace("_", " ") : "Administrator"

    return (
        <aside
            className={cn(
                "cedar-admin-sidebar flex flex-col h-full min-w-0 transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Brand Identity + Hamburger Toggle */}
            <div
                className={cn(
                    "flex-shrink-0",
                    collapsed ? "px-2 pt-3 pb-2" : "px-3.5 pt-3.5 pb-2.5"
                )}
            >
                {collapsed ? (
                    // Collapsed: logo that becomes hamburger on hover
                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            aria-label="Expand sidebar"
                            title="Expand sidebar"
                            className="cedar-admin-logo-toggle group relative inline-flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors cursor-pointer"
                            style={{ color: "#77736D" }}
                        >
                            {/* Logo — hidden on hover */}
                            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                                <NextImage
                                    src="/logo/CEIicon.png"
                                    alt="Cedar Elevators"
                                    width={22}
                                    height={22}
                                    className="object-contain"
                                />
                            </span>
                            {/* Hamburger — visible on hover */}
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                                <Menu className="h-4 w-4" />
                            </span>
                        </button>
                    </div>
                ) : (
                    // Expanded: logo + brand text + hamburger on the right
                    <div className="flex items-center justify-between gap-2">
                        <Link
                            href="/admin"
                            onClick={onNavigate}
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                        >
                            <div className="relative w-7 h-7 flex-shrink-0">
                                <NextImage
                                    src="/logo/CEIicon.png"
                                    alt="Cedar Elevators"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span
                                    className="text-[14.5px] font-semibold tracking-tight block truncate leading-tight"
                                    style={{ color: "#171717" }}
                                >
                                    Cedar Admin
                                </span>
                                <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: "#77736D" }}>
                                    Elevator Solutions
                                </p>
                            </div>
                        </Link>

                        {onToggleCollapse && (
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                aria-label="Collapse sidebar"
                                title="Collapse sidebar"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[7px] text-[#77736D] hover:bg-black/5 hover:text-[#171717] transition-colors flex-shrink-0 cursor-pointer"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Sidebar Search Bar — compact & minimal */}
                <div className={cn("mt-2.5", collapsed && "flex justify-center")}>
                    {collapsed ? (
                        <button
                            type="button"
                            onClick={triggerGlobalSearch}
                            title="Search (Ctrl+J)"
                            aria-label="Search quotations, customers, products"
                            className="cedar-admin-nav-item justify-center px-2 cursor-pointer"
                        >
                            <Search className="h-3.5 w-3.5" style={{ color: "#77736D" }} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={triggerGlobalSearch}
                            className="cedar-admin-search-trigger"
                        >
                            <Search className="mr-1.5 h-3 w-3 flex-shrink-0" style={{ color: "#A09B94" }} />
                            <span className="truncate flex-1">Search...</span>
                            <kbd className="cedar-admin-kbd ml-1 flex-shrink-0">
                                <Command className="h-2.5 w-2.5" />
                                J
                            </kbd>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Groups */}
            <div
                className={cn(
                    "flex-1 overflow-hidden py-1.5",
                    collapsed ? "px-2" : "px-3"
                )}
            >
                <ScrollArea className="h-full">
                    <div className={cn("space-y-1", collapsed ? "" : "pr-1")}>
                        {mainNavItems.map((item) => (
                            <SidebarNavItem
                                key={item.href}
                                item={item}
                                isActive={isRouteActive(item.href)}
                                collapsed={collapsed}
                                newQuotesCount={newQuotesCount}
                                onNavigate={onNavigate}
                            />
                        ))}

                        {/* Catalog Section */}
                        <div className="pt-3.5">
                            {!collapsed ? (
                                <button
                                    type="button"
                                    onClick={() => setCatalogExpanded(!catalogExpanded)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition-colors cursor-pointer"
                                    style={{ color: "#A09B94" }}
                                >
                                    <span>Catalog</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            catalogExpanded ? "" : "-rotate-90"
                                        )}
                                    />
                                </button>
                            ) : (
                                <div className="h-px my-2 mx-1" style={{ backgroundColor: "#EAE8E2" }} />
                            )}
                        </div>

                        {(collapsed || catalogExpanded) &&
                            catalogNavItems.map((item) => (
                                <SidebarNavItem
                                    key={item.href}
                                    item={item}
                                    isActive={isRouteActive(item.href)}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                />
                            ))}

                        {/* Other Section */}
                        <div className="pt-3.5">
                            {!collapsed ? (
                                <button
                                    type="button"
                                    onClick={() => setOtherExpanded(!otherExpanded)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition-colors cursor-pointer"
                                    style={{ color: "#A09B94" }}
                                >
                                    <span>Other</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            otherExpanded ? "" : "-rotate-90"
                                        )}
                                    />
                                </button>
                            ) : (
                                <div className="h-px my-2 mx-1" style={{ backgroundColor: "#EAE8E2" }} />
                            )}
                        </div>

                        {(collapsed || otherExpanded) &&
                            otherNavItems.map((item) => (
                                <SidebarNavItem
                                    key={item.href}
                                    item={item}
                                    isActive={isRouteActive(item.href)}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                />
                            ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer: Admin Profile with 3-dot dropdown */}
            <div
                className={cn(
                    "cedar-admin-sidebar-divider flex-shrink-0 py-2.5 mt-auto border-t relative",
                    collapsed ? "px-2" : "px-3"
                )}
                ref={profileMenuRef}
            >
                <button
                    type="button"
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    title={collapsed ? `${displayName} (${roleLabel})` : undefined}
                    className={cn(
                        "w-full flex items-center rounded-[8px] transition-colors hover:bg-black/5 cursor-pointer",
                        collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"
                    )}
                >
                    <Avatar className="h-7 w-7 flex-shrink-0" style={{ border: "1px solid #DCD8CE" }}>
                        <AvatarImage
                            src={profile?.avatar_url || "/avatars/admin.png"}
                            alt={displayName}
                        />
                        <AvatarFallback
                            className="text-[11px] font-medium"
                            style={{ backgroundColor: "#FFFFFF", color: "#171717" }}
                        >
                            {getInitial(profile?.display_name || user?.email || "A")}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <>
                            <div className="min-w-0 flex-1 text-left">
                                <p
                                    className="text-[12.5px] font-medium leading-tight truncate"
                                    style={{ color: "#171717" }}
                                >
                                    {displayName}
                                </p>
                                <p
                                    className="text-[11px] capitalize leading-tight truncate mt-0.5"
                                    style={{ color: "#77736D" }}
                                >
                                    {roleLabel}
                                </p>
                            </div>
                            <MoreHorizontal
                                className="h-4 w-4 flex-shrink-0"
                                style={{ color: "#A09B94" }}
                            />
                        </>
                    )}
                </button>

                {/* Profile dropdown menu */}
                    {profileMenuOpen && (
                        <div
                            className="absolute left-0 right-0 bottom-full mb-1.5 z-50 overflow-hidden rounded-[10px] shadow-lg"
                            style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #EAE8E2",
                                boxShadow: "0 8px 24px rgba(23,23,23,0.10)",
                                minWidth: collapsed ? "auto" : undefined,
                                left: collapsed ? "-8px" : 0,
                                right: collapsed ? "-8px" : 0,
                            }}
                        >
                            {/* Profile option */}
                            <Link
                                href="/admin/settings/profile"
                                onClick={() => { setProfileMenuOpen(false); onNavigate?.() }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/[0.04]"
                                style={{ color: "#171717" }}
                            >
                                <User className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#77736D" }} />
                                <span>Profile</span>
                            </Link>

                            {/* Settings option */}
                            <Link
                                href="/admin/settings"
                                onClick={() => { setProfileMenuOpen(false); onNavigate?.() }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/[0.04]"
                                style={{ color: "#171717", borderTop: "1px solid #EAE8E2" }}
                            >
                                <Settings className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#77736D" }} />
                                <span>Settings</span>
                            </Link>

                            {/* Logout option */}
                            <button
                                type="button"
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors cursor-pointer hover:bg-red-50"
                                style={{ color: "#C84B42", borderTop: "1px solid #EAE8E2" }}
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                data-testid="admin-sidebar-logout-button"
                            >
                                <LogOut className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#C84B42" }} />
                                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </button>
                        </div>
                    )}
            </div>

            {showGlobalSearch && <GlobalSearch />}
        </aside>
    )
}
