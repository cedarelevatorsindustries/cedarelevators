import { AlertTriangle, Package, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NoProductsWarningProps {
  className?: string
  showCreateButton?: boolean
}

export function NoProductsWarning({ className, showCreateButton = true }: NoProductsWarningProps) {
  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 font-semibold">No Products Available</AlertTitle>
      <AlertDescription className="text-orange-800">
        <p className="mb-3">
          You need to add products first before you can create categories or collections.
          Products are required to organize your catalog effectively.
        </p>
        {showCreateButton && (
          <Button
            asChild
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Link href="/admin/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Products First
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface ProductCountBadgeProps {
  count: number
  className?: string
}

export function ProductCountBadge({ count, className }: ProductCountBadgeProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Package className="h-4 w-4 text-gray-500" />
      <span className="text-gray-600">
        {count} {count === 1 ? 'product' : 'products'} available
      </span>
    </div>
  )
}
