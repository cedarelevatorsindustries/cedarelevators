"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Edit,
  ExternalLink,
  Package,
  IndianRupee,
  Warehouse,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  Archive,
  Trash2,
  Plus,
  FolderTree
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductImageCarousel } from '@/components/product-image-carousel'
import { Switch } from '@/components/ui/switch'

interface ProductDetailViewProps {
  product: any // Type from domain
  variants?: any[] // Product variants
}

export function ProductDetailView({ product, variants = [] }: ProductDetailViewProps) {
  // State for variant status toggles
  const [variantStatuses, setVariantStatuses] = useState<Record<string, boolean>>(
    variants.reduce((acc, variant) => ({
      ...acc,
      [variant.id]: variant.status === 'active'
    }), {})
  )
  // Handler for variant status toggle
  const handleVariantStatusToggle = (variantId: string) => {
    setVariantStatuses(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }))
    // TODO: Call API to update variant status in database
    console.log(`Toggle variant ${variantId} to ${!variantStatuses[variantId] ? 'active' : 'inactive'}`)
  }

  // FRONTEND RESPONSIBILITY: Display state, navigation, read-only calculations

  // Calculate display values (read-only, no business logic)
  const images = Array.isArray(product.images) ? product.images : []
  const imageUrls = images.map((img: any) => {
    if (typeof img === 'string') return img
    if (img && typeof img === 'object' && img.url) return img.url
    return null
  }).filter(Boolean) as string[]

  const primaryImage = images[0]?.url || images[0] || null
  const totalStock = product.stock_quantity || 0
  const specifications = Array.isArray(product.specifications) ? product.specifications : []
  const tags = Array.isArray(product.tags) ? product.tags : []

  // Stock status (display only)
  const getStockStatus = () => {
    if (totalStock === 0) return { label: 'Out of Stock', color: 'destructive' as const }
    if (totalStock < (product.low_stock_threshold || 10)) return { label: 'Low Stock', color: 'secondary' as const }
    return { label: 'In Stock', color: 'default' as const }
  }

  const stockStatus = getStockStatus()

  // Calculate discount percentage
  const discountPercent = product.compare_at_price && product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header - Modern design with product image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Product Image - Larger and more prominent */}
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              {primaryImage && typeof primaryImage === 'string' && primaryImage.trim() !== '' ? (
                <Image
                  src={primaryImage}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-3">
                <Badge
                  variant={product.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {product.status || 'draft'}
                </Badge>
                <span className="text-sm text-gray-500">#{product.id.slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/products/${product.slug}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Storefront
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-[#ff3705] hover:bg-[#e63305] text-white"
              asChild
            >
              <Link href={`/admin/products/${product.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary - Modern card design */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {primaryImage && typeof primaryImage === 'string' && primaryImage.trim() !== '' ? (
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-4 h-4 text-[#ff3705]" />
                  )}
                </div>
                <CardTitle className="text-base font-semibold">
                  Product Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Handle</label>
                  <p className="text-gray-900">{product.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-gray-900 font-mono text-sm">{product.sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {product.status || 'draft'}
                  </Badge>
                </div>
              </div>

              {product.short_description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Short Description</label>
                  <p className="text-gray-900">{product.short_description}</p>
                </div>
              )}


              {tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary - Modern design with rupee symbols */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {primaryImage && typeof primaryImage === 'string' && primaryImage.trim() !== '' ? (
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IndianRupee className="w-4 h-4 text-[#ff3705]" />
                  )}
                </div>
                <CardTitle className="text-base font-semibold">
                  Pricing Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Price</span>
                  <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN') || 'N/A'}</span>
                </div>
                {product.compare_at_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Compare Price</span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.compare_at_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Discount</span>
                    <Badge className="bg-green-600 text-white">{discountPercent}% OFF</Badge>
                  </div>
                )}
                {product.cost_per_item && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Cost per Item</span>
                    <span className="text-sm font-semibold text-gray-900">₹{product.cost_per_item.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          {specifications.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {primaryImage && typeof primaryImage === 'string' && primaryImage.trim() !== '' ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <List className="w-4 h-4 text-[#ff3705]" />
                    )}
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Specifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {specifications.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-600">{spec.key}</span>
                      <span className="text-sm text-gray-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Variants - Modern table design */}
          {variants.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {primaryImage && typeof primaryImage === 'string' && primaryImage.trim() !== '' ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-[#ff3705]" />
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold">
                      Product Variants ({variants.length})
                    </CardTitle>
                  </div>
                  <Button size="sm" className="bg-[#ff3705] hover:bg-[#e63305] text-white" asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Variant</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant: any) => (
                      <TableRow key={variant.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {variant.name || 'Default Variant'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {variant.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{variant.price?.toLocaleString('en-IN') || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <Warehouse className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {variant.inventory_items && variant.inventory_items[0]
                                  ? variant.inventory_items[0].quantity
                                  : (variant.inventory_quantity || 0)} Total
                              </span>
                            </div>
                            {variant.inventory_items && variant.inventory_items[0] && (
                              <div className="flex text-xs space-x-2 text-gray-500 pl-6">
                                <span className="text-green-600 font-medium">
                                  {variant.inventory_items[0].available_quantity ?? variant.inventory_items[0].quantity} Avail
                                </span>
                                {variant.inventory_items[0].reserved > 0 && (
                                  <span className="text-amber-600 font-medium">
                                    {variant.inventory_items[0].reserved} Rsrvd
                                  </span>
                                )}
                              </div>
                            )}
                            {(variant.inventory_quantity === 0 || (variant.inventory_items && variant.inventory_items[0]?.quantity === 0)) && (
                              <Badge variant="destructive" className="text-xs w-fit">Out of Stock</Badge>
                            )}
                            {(variant.inventory_quantity > 0 && variant.inventory_quantity < 10) && (
                              <Badge variant="secondary" className="text-xs w-fit">Low Stock</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={variantStatuses[variant.id] || false}
                              onCheckedChange={() => handleVariantStatusToggle(variant.id)}
                              className="data-[state=checked]:bg-green-600"
                            />
                            <span className="text-sm text-gray-600">
                              {variantStatuses[variant.id] ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inventory Summary - FRONTEND: Display aggregated values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Warehouse className="w-5 h-5 mr-2" />
                Inventory Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Stock</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{totalStock}</span>
                  <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Track Inventory</span>
                <Badge variant={product.track_inventory ? 'default' : 'secondary'}>
                  {product.track_inventory ? 'ON' : 'OFF'}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Backorders</span>
                <Badge variant={product.allow_backorders ? 'default' : 'secondary'}>
                  {product.allow_backorders ? 'Allowed' : 'Not Allowed'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/inventory">
                    <Warehouse className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Classification - Display catalog placement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderTree className="w-5 h-5 mr-2" />
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Applications */}
              {product.application_ids && product.application_ids.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Applications</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-900 border-orange-300">
                      {product.application_ids.length} selected
                    </Badge>
                  </div>
                </div>
              )}

              {/* Categories */}
              {product.category_ids && product.category_ids.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Categories</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-900 border-blue-300">
                      {product.category_ids.length} selected
                    </Badge>
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {product.subcategory_ids && product.subcategory_ids.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Subcategories</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-900 border-purple-300">
                      {product.subcategory_ids.length} selected
                    </Badge>
                  </div>
                </div>
              )}

              {/* Elevator Types */}
              {product.elevator_type_ids && product.elevator_type_ids.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Elevator Types</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-900 border-green-300">
                      {product.elevator_type_ids.length} selected
                    </Badge>
                  </div>
                </div>
              )}

              {/* Collections */}
              {product.collection_ids && product.collection_ids.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Collections</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-900 border-pink-300">
                      {product.collection_ids.length} selected
                    </Badge>
                  </div>
                </div>
              )}

              {/* No Classification Message */}
              {(!product.application_ids || product.application_ids.length === 0) &&
                (!product.category_ids || product.category_ids.length === 0) &&
                (!product.subcategory_ids || product.subcategory_ids.length === 0) &&
                (!product.elevator_type_ids || product.elevator_type_ids.length === 0) &&
                (!product.collection_ids || product.collection_ids.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No classifications assigned</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Add Classifications
                      </Link>
                    </Button>
                  </div>
                )}

              <Separator />

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Classifications
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Product Images - FRONTEND: Display images carousel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImageCarousel images={imageUrls} productName={product.name} />
            </CardContent>
          </Card>

          {/* Description Preview - FRONTEND: Display content */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Specifications */}
          {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(product.technical_specs).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-gray-900 text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cedar-Specific Fields */}
          {(product.voltage || product.load_capacity_kg || product.speed_ms) && (
            <Card>
              <CardHeader>
                <CardTitle>Elevator Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.voltage && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Voltage</span>
                      <span className="font-medium">{product.voltage}</span>
                    </div>
                  )}
                  {product.load_capacity_kg && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Load Capacity</span>
                      <span className="font-medium">{product.load_capacity_kg} kg</span>
                    </div>
                  )}
                  {product.speed_ms && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Speed</span>
                      <span className="font-medium">{product.speed_ms} m/s</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Information */}
          {(product.meta_title || product.meta_description) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.meta_title && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meta Title</label>
                      <p className="text-gray-900 text-sm">{product.meta_title}</p>
                    </div>
                  )}
                  {product.meta_description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meta Description</label>
                      <p className="text-gray-900 text-sm">{product.meta_description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

