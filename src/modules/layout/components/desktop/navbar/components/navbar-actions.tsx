"use client"

import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { useUser } from "@/lib/auth/client"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { ProfileMenu } from "./profile-menu"
import { MoreMenu } from "./more-menu"
import { DeliverToMenu } from "./deliver-to-menu"
import { LoginHoverCard } from "./login-hover-card"
import { LinkHoverCard } from "./link-hover-card"
import { CartHoverCardContent } from "./cart-hover-card"
import { WishlistHoverCardContent } from "./wishlist-hover-card"
import type { NavbarConfig } from "../config"
import type { UserType } from "@/types/cart.types"

interface NavbarActionsProps {
    config: NavbarConfig
    isTransparent: boolean
    pathname: string
    isScrolled: boolean
}

export function NavbarActions({ config, isTransparent, pathname, isScrolled }: NavbarActionsProps) {
    const { user, isLoaded } = useUser()
    const { count: wishlistCount } = useWishlist()
    const [cartItemCount] = useState(0) // TODO: Get from cart context
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

    // Mock cart data - TODO: Get from cart context
    const cartItems: never[] = [] // Empty for now
    const cartTotal = "₹0.00"

    // Determine user type - hide cart for individual and guest users
    const userType: UserType = user?.userType === 'verified' ? 'business_verified' :
        user?.userType === 'business' ? 'business_unverified' :
            user?.userType === 'individual' ? 'individual' : 'guest'

    const showCart = userType === 'business_verified' || userType === 'business_unverified'

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
                <WishlistHoverCardContent />
            </LinkHoverCard>

            {/* Shopping Cart with Hover Card - Only for business users */}
            {showCart && (
                <>
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
                </>
            )}

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

