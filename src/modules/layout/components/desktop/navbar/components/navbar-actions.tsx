"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Bell } from "lucide-react"
import { useUser } from "@/lib/auth/client"
import { useNotifications } from "@/lib/hooks"
import { useNotificationSidebar } from "@/lib/context/notification-sidebar-context"
import { ProfileMenu } from "./profile-menu"
import { MoreMenu } from "./more-menu"
import { DeliverToMenu } from "./deliver-to-menu"
import { LoginHoverCard } from "./login-hover-card"
import { LinkHoverCard } from "./link-hover-card"
import { CartHoverCardContent } from "./cart-hover-card"
import { NotificationHoverCardContent } from "./notification-hover-card"
import { WishlistHoverCardContent } from "./wishlist-hover-card"
import type { NavbarConfig } from "../config"

interface NavbarActionsProps {
    config: NavbarConfig
    isTransparent: boolean
    pathname: string
    isScrolled: boolean
}

export function NavbarActions({ config, isTransparent, pathname, isScrolled }: NavbarActionsProps) {
    const { user, isLoaded } = useUser()
    const [cartItemCount] = useState(0) // TODO: Get from cart context
    const [wishlistCount] = useState(0) // TODO: Get from wishlist context
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const { openSidebar } = useNotificationSidebar()

    // Real-time notifications via Pusher
    const { unreadCount: notificationCount } = useNotifications({ 
        customerId: user?.id,
        channel: user?.id ? `user-${user.id}` : 'my-channel'
    })

    // Mock cart data - TODO: Get from cart context
    const cartItems: never[] = [] // Empty for now
    const cartTotal = "₹0.00"
    
    // Mock wishlist - TODO: Get from wishlist context
    const wishlistItems: never[] = [] // Empty for now

    return (
        <div 
            className="flex items-center gap-4 mr-2"
            onMouseEnter={() => setIsMoreMenuOpen(false)}
        >
            {/* Deliver to Menu */}
            <DeliverToMenu isTransparent={isTransparent} onHover={() => setIsMoreMenuOpen(false)} />

            {/* Divider */}
            <div className={`h-6 w-px ${isTransparent ? 'bg-white/30' : 'bg-gray-300'}`} />

            {/* Wishlist with Hover Card */}
            <LinkHoverCard
                href="/wishlist"
                icon={<Heart size={20} />}
                label="Wishlist"
                isTransparent={isTransparent}
                badge={wishlistCount}
                onHover={() => setIsMoreMenuOpen(false)}
            >
                <WishlistHoverCardContent items={wishlistItems} />
            </LinkHoverCard>

            {/* Notifications with Hover Card (only for logged in users) */}
            {user && (
                <LinkHoverCard
                    href="/notifications"
                    icon={<Bell size={20} />}
                    label="Notifications"
                    isTransparent={isTransparent}
                    badge={notificationCount}
                    badgeColor="bg-red-600"
                    onHover={() => setIsMoreMenuOpen(false)}
                >
                    {(closeCard) => (
                        <NotificationHoverCardContent 
                            customerId={user.id} 
                            channel={`user-${user.id}`}
                            onOpenSidebar={openSidebar}
                            onClose={closeCard}
                        />
                    )}
                </LinkHoverCard>
            )}

            {/* Shopping Cart with Hover Card */}
            <LinkHoverCard
                href="/cart"
                icon={<ShoppingCart size={20} />}
                label="Shopping Cart"
                text="Cart"
                isTransparent={isTransparent}
                badge={cartItemCount}
                onHover={() => setIsMoreMenuOpen(false)}
            >
                <CartHoverCardContent items={cartItems} total={cartTotal} />
            </LinkHoverCard>

            {/* Divider */}
            <div className={`h-6 w-px ${isTransparent ? 'bg-white/30' : 'bg-gray-300'}`} />

            {/* User Profile - Icon Only or Login with Hover */}
            {isLoaded && user ? (
                <ProfileMenu isTransparent={isTransparent} onHover={() => setIsMoreMenuOpen(false)} />
            ) : (
                <LoginHoverCard isTransparent={isTransparent} onHover={() => setIsMoreMenuOpen(false)} />
            )}

            {/* More Menu */}
            <MoreMenu 
                isTransparent={isTransparent} 
                isLoggedIn={!!user} 
                isScrolled={isScrolled}
                isOpen={isMoreMenuOpen}
                onOpenChange={setIsMoreMenuOpen}
            />
        </div>
    )
}
