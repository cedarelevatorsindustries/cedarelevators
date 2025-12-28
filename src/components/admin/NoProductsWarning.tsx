"use client"

import { AlertTriangle, Package, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NoProductsWarningProps {
  title?: string
  description?: string
  showCreateButton?: boolean
  createButtonText?: string
  createButtonHref?: string
  variant?: "default" | "destructive"
}

export function NoProductsWarning({
  title = "No Products Available",
  description = "You need to create products before you can create categories or collections. Products are required to organize your catalog.",
  showCreateButton = true,
  createButtonText = "Create First Product",
  createButtonHref = "/admin/products/create",
  variant = "destructive"
}: NoProductsWarningProps) {
  return (
    <Alert
      variant={variant}
      className="border-2 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <AlertDescription className="text-sm text-gray-600 leading-relaxed">
              {description}
            </AlertDescription>
          </div>

          {showCreateButton && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                asChild
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              >
                <Link href={createButtonHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createButtonText}
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Package className="h-4 w-4" />
                <span>Products are the foundation of your catalog</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}

// Compact version for inline use
export function NoProductsWarningCompact() {
  return (
    <div className="rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/50 p-6 text-center">
      <div className="flex justify-center mb-3">
        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
          <Package className="h-6 w-6 text-orange-600" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No Products Yet
      </h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
        Create products first to build your catalog structure.
      </p>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-orange-300 text-orange-700 hover:bg-orange-100"
      >
        <Link href="/admin/products/create">
          <Plus className="mr-2 h-4 w-4" />
          Add Products
        </Link>
      </Button>
    </div>
  )
}
