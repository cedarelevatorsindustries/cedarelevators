import WishlistSection from '@/modules/profile/components/sections/wishlist-section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Wishlist | Cedar B2B Storefront",
  description: "View your saved items",
}

export default function WishlistPage() {
  return <WishlistSection />
}
