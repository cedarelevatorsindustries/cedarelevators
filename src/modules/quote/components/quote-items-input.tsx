'use client'

import React, { useState, useEffect } from 'react'
import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Plus, X, Package, AlertCircle, Loader2 } from 'lucide-react'
import {
  getProductsForQuote,
  searchProductsForQuote,
  getProductVariants,
  ProductOption,
} from '@/lib/actions/quote-products'
import { QuoteSelect } from './quote-select'
import { VariantSelectors } from './variant-selectors'

export interface InitialQuoteItemMeta {
  product_id: string
  variant_id?: string
  quantity: number
  name: string
  sku?: string
  thumbnail?: string | null
  variant_title?: string | null
  specifications?: Record<string, any> | null
}

interface QuoteItemsInputProps {
  control: Control<any>
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  initialItems?: InitialQuoteItemMeta[]
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}

export function QuoteItemsInput({
  control,
  register,
  errors,
  initialItems = [],
  setValue,
  watch,
}: QuoteItemsInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [productMetaMap, setProductMetaMap] = useState<Map<string, ProductOption>>(() => {
    const map = new Map<string, ProductOption>()
    for (const item of initialItems) {
      map.set(item.product_id, {
        value: item.product_id,
        name: item.name,
        label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
        sku: item.sku || '',
        thumbnail: item.thumbnail || null,
        specifications: item.specifications || null,
      })
    }
    return map
  })
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const [variantOptionsMap, setVariantOptionsMap] = useState<Map<string, any[]>>(new Map())
  const [loadingVariantsMap, setLoadingVariantsMap] = useState<Map<string, boolean>>(new Map())

  const watchedItems = watch('items') || []

  useEffect(() => {
    loadProducts()
    // Preload variants for any initial products
    const uniqueIds = Array.from(new Set(initialItems.map((i) => i.product_id).filter(Boolean)))
    for (const pid of uniqueIds) {
      loadVariants(pid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProducts = async (query?: string) => {
    setIsLoadingProducts(true)
    const result = query ? await searchProductsForQuote(query) : await getProductsForQuote()

    if (result.success && result.products) {
      const merged = [...result.products]
      const existingValues = new Set(merged.map((p) => p.value))

      for (const item of initialItems) {
        if (!existingValues.has(item.product_id)) {
          merged.unshift({
            value: item.product_id,
            name: item.name,
            label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
            sku: item.sku || '',
            thumbnail: item.thumbnail || null,
            specifications: item.specifications || null,
          })
          existingValues.add(item.product_id)
        }
      }

      setProductOptions(merged)
      setProductMetaMap((prev) => {
        const next = new Map(prev)
        for (const p of merged) {
          next.set(p.value, p)
        }
        return next
      })
    }
    setIsLoadingProducts(false)
  }

  const handleSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      loadProducts(query)
    }, 300)
    setSearchTimeout(timeout)
  }

  const loadVariants = async (productId: string) => {
    if (!productId || variantOptionsMap.has(productId)) return

    setLoadingVariantsMap((prev) => new Map(prev).set(productId, true))
    const result = await getProductVariants(productId)
    if (result.success && result.variants) {
      setVariantOptionsMap((prev) => new Map(prev).set(productId, result.variants || []))
    }
    setLoadingVariantsMap((prev) => new Map(prev).set(productId, false))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Selected Components</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Add products for itemized pricing, or leave empty for a general project enquiry.
          </p>
        </div>
        <button
          type="button"
          onClick={() => append({ product_id: '', variant_id: '', quantity: 1 })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const selectedProductId = watchedItems[index]?.product_id || ''
          const selectedVariantId = watchedItems[index]?.variant_id || ''
          const productMeta = selectedProductId ? productMetaMap.get(selectedProductId) : undefined
          const variants = selectedProductId ? variantOptionsMap.get(selectedProductId) || [] : []
          const isLoadingVars = selectedProductId ? loadingVariantsMap.get(selectedProductId) || false : false
          const hasOptions = variants.some((v: any) => v.options && Object.keys(v.options).length > 0)
          const selectedVariantMeta = variants.find((v: any) => v.value === selectedVariantId)
          const displaySku = selectedVariantMeta?.sku || productMeta?.sku

          const specsEntries =
            productMeta?.specifications && typeof productMeta.specifications === 'object'
              ? Object.entries(productMeta.specifications)
                  .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
                  .slice(0, 4)
              : []

          return (
            <div
              key={field.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors"
            >
              <div className="flex gap-4 items-start">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  {productMeta?.thumbnail ? (
                    <img
                      src={productMeta.thumbnail}
                      alt={productMeta.name || 'Component'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Selection & Metadata */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-medium text-gray-700">
                        Product {index + 1}
                      </label>
                      {displaySku && (
                        <span className="text-[11px] font-mono text-gray-500">
                          SKU: {displaySku}
                        </span>
                      )}
                    </div>
                    <Controller
                      control={control}
                      name={`items.${index}.product_id`}
                      render={({ field: { onChange, value } }) => (
                        <QuoteSelect
                          value={value}
                          onChange={(newValue: string) => {
                            onChange(newValue)
                            setValue(`items.${index}.variant_id`, '')
                            loadVariants(newValue)
                          }}
                          options={productOptions}
                          placeholder="Search or select a component..."
                          error={errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.product_id}
                          onSearch={handleSearch}
                          isLoading={isLoadingProducts}
                        />
                      )}
                    />
                    {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.product_id && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {(errors.items as any)[index]?.product_id?.message as string}
                      </p>
                    )}
                  </div>

                  {/* Specs snapshot summary */}
                  {specsEntries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {specsEntries.map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-gray-200 text-[11px] text-gray-600"
                        >
                          <span className="font-medium text-gray-800 mr-1">{k}:</span> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Variant Selection */}
                  {variants.length > 0 && (
                    <div>
                      {!hasOptions && (
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Variant
                        </label>
                      )}
                      <Controller
                        control={control}
                        name={`items.${index}.variant_id`}
                        render={({ field: { onChange, value } }) =>
                          hasOptions ? (
                            <VariantSelectors
                              variants={variants}
                              value={value}
                              onChange={onChange}
                            />
                          ) : (
                            <QuoteSelect
                              value={value}
                              onChange={onChange}
                              options={variants}
                              placeholder="Select variant (optional)"
                              error={errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.variant_id}
                              isLoading={isLoadingVars}
                            />
                          )
                        }
                      />
                    </div>
                  )}

                  {isLoadingVars && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading variants...
                    </p>
                  )}

                  {/* Quantity */}
                  <div className="max-w-[160px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Quantity Required
                    </label>
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                      min={1}
                      max={10000}
                    />
                    {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.quantity && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {(errors.items as any)[index]?.quantity?.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove product"
                  aria-label="Remove product"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {errors.items && typeof errors.items.message === 'string' && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.items.message}
        </p>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8 px-4 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-800">General Project / Component Enquiry</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            You can submit this request with your project requirements directly, or add specific components below.
          </p>
          <button
            type="button"
            onClick={() => append({ product_id: '', variant_id: '', quantity: 1 })}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a Product
          </button>
        </div>
      )}
    </div>
  )
}
