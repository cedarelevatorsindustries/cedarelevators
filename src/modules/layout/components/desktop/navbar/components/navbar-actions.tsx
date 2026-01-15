"use client"

import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { useUser } from "@/lib/auth/client"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useCart } from "@/contexts/cart-context"
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
    const { summary, derivedItems } = useCart()
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

    // Get cart data from context
    const cartItemCount = summary.itemCount || 0
    const cartTotal = `₹${summary.total.toLocaleString()}`

    // Transform derivedItems to match CartHoverCardContent format
    const cartItems = derivedItems.map(item => ({
        id: item.id,
        title: item.title,
        image: item.thumbnail || undefined,
        price: `₹${item.unit_price.toLocaleString()}`,
        quantity: item.quantity
    }))

    // Determine if user can access cart - Only verified business users
    const isVerifiedBusiness = user?.business?.verification_status === 'verified'
    const showCart = isVerifiedBusiness

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

            {/* Shopping Cart with Hover Card - Only for verified business users */}
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

