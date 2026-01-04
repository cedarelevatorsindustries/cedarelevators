"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"

interface CartItem {
  id: string
  title: string
  image?: string
  price: string
  quantity: number
}

interface CartHoverCardContentProps {
  items: CartItem[]
  total: string
}

export function CartHoverCardContent({ items, total }: CartHoverCardContentProps) {
  if (items.length === 0) {
    return (
      <div className="w-80 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Shopping cart</h3>
        <p className="text-sm text-gray-600 mb-4">Your cart is empty</p>
        <LocalizedClientLink
          href="/catalog"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Start Shopping
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="w-96">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Shopping cart</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex gap-3">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {item.price} x {item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Total:</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
        <LocalizedClientLink
          href="/cart"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Go to cart
        </LocalizedClientLink>
      </div>
    </div>
  )
}

