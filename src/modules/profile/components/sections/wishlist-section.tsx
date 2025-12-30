import { Heart } from 'lucide-react'
import FavoritesList from '../favorites-list'

export default function WishlistSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Favorites</h2>
          <p className="mt-1 text-sm text-gray-600">
            Products you have gathered
          </p>
        </div>
      </div>

      <FavoritesList />
    </div>
  )
}
