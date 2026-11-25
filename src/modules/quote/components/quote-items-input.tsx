'use client'

import React, { useState, useEffect } from 'react'
import {
  useFieldArray,
  Control,
  FieldErrors,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Plus, Trash2, Package, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getProductsForQuote,
  searchProductsForQuote,
  getProductVariants,
  ProductOption,
} from '@/lib/actions/quote-products'
import { QuoteSelect } from './quote-select'
import { VariantSelectors } from './variant-selectors'
import { QuantityControl } from './shared/quantity-control'

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
  errors: FieldErrors<any>
  initialItems?: InitialQuoteItemMeta[]
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}

export function QuoteItemsInput({
  control,
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

  const watchedItems: Array<{ product_id?: string; variant_id?: string; quantity?: number }> =
    watch('items') || []

  useEffect(() => {
    loadProducts()
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

  const mergeDuplicateIfPresent = (
    currentIndex: number,
    candidateProductId: string,
    candidateVariantId: string
  ): boolean => {
    if (!candidateProductId) return false
    const normVariant = candidateVariantId || ''
    const existingIndex = watchedItems.findIndex(
      (item, idx) =>
        idx !== currentIndex &&
        (item?.product_id || '') === candidateProductId &&
        (item?.variant_id || '') === normVariant
    )

    if (existingIndex === -1) return false

    const currentQty = Math.max(1, Number(watchedItems[currentIndex]?.quantity) || 1)
    const existingQty = Math.max(1, Number(watchedItems[existingIndex]?.quantity) || 1)
    const combinedQty = Math.min(10000, existingQty + currentQty)

    setValue(`items.${existingIndex}.quantity`, combinedQty, {
      shouldDirty: true,
      shouldValidate: true,
    })
    remove(currentIndex)
    toast.info('Item already in your selection — quantity updated.')
    return true
  }

  return (
    <div className="space-y-4">
      {fields.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="type-body-sm text-gray-500">
            Select components and specify quantities. Different variants stay separate items.
          </p>
          <button
            type="button"
            onClick={() => append({ product_id: '', variant_id: '', quantity: 1 })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      )}

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-5 py-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-900">No products added yet</p>
          <p className="type-body-sm text-gray-500 mt-1 max-w-md mx-auto">
            If you have specific products in mind, add them here. Otherwise, continue with a general enquiry.
          </p>
          <button
            type="button"
            onClick={() => append({ product_id: '', variant_id: '', quantity: 1 })}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:border-orange-500 text-gray-800 hover:text-orange-600 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const selectedProductId = watchedItems[index]?.product_id || ''
            const selectedVariantId = watchedItems[index]?.variant_id || ''
            const productMeta = selectedProductId ? productMetaMap.get(selectedProductId) : undefined
            const variants = selectedProductId ? variantOptionsMap.get(selectedProductId) || [] : []
            const isLoadingVars = selectedProductId
              ? loadingVariantsMap.get(selectedProductId) || false
              : false
            const hasOptions = variants.some(
              (v: any) => v.options && Object.keys(v.options).length > 0
            )
            const selectedVariantMeta = variants.find((v: any) => v.value === selectedVariantId)
            const displaySku = selectedVariantMeta?.sku || productMeta?.sku

            const specsEntries =
              productMeta?.specifications && typeof productMeta.specifications === 'object'
                ? Object.entries(productMeta.specifications)
                    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
                    .slice(0, 3)
                : []

            const rowProductError =
              errors.items && Array.isArray(errors.items)
                ? (errors.items as any)[index]?.product_id
                : undefined
            const rowQuantityError =
              errors.items && Array.isArray(errors.items)
                ? (errors.items as any)[index]?.quantity
                : undefined

            return (
              <div
                key={field.id}
                className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 sm:p-5 transition-colors hover:border-gray-300"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Thumbnail + Mobile Top Row */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {productMeta?.thumbnail ? (
                          <img
                            src={productMeta.thumbnail}
                            alt={productMeta.name || 'Selected product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="sm:hidden">
                        <p className="type-label text-gray-500">Item {index + 1}</p>
                        {displaySku && (
                          <p className="text-xs font-mono text-gray-500 mt-0.5">SKU: {displaySku}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove item ${index + 1}`}
                      className="sm:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selection, Variant, Specs, Quantity */}
                  <div className="flex-1 w-full min-w-0 space-y-3">
                    <div>
                      <div className="hidden sm:flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor={`quote-item-product-${index}`}
                          className="text-xs text-gray-600"
                        >
                          Product {index + 1}
                        </label>
                        {displaySku && (
                          <span className="text-xs font-mono text-gray-500">
                            SKU: {displaySku}
                          </span>
                        )}
                      </div>

                      <Controller
                        control={control}
                        name={`items.${index}.product_id`}
                        render={({ field: { onChange, value } }) => (
                          <QuoteSelect
                            id={`quote-item-product-${index}`}
                            value={value}
                            onChange={(newProductId: string) => {
                              // Check whether selecting this product with empty variant matches another row
                              if (mergeDuplicateIfPresent(index, newProductId, '')) {
                                return
                              }
                              onChange(newProductId)
                              setValue(`items.${index}.variant_id`, '')
                              loadVariants(newProductId)
                            }}
                            options={productOptions}
                            placeholder="Search or select a product..."
                            error={rowProductError}
                            onSearch={handleSearch}
                            isLoading={isLoadingProducts}
                          />
                        )}
                      />

                      {rowProductError && (
                        <p role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{rowProductError.message as string}</span>
                        </p>
                      )}
                    </div>

                    {specsEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {specsEntries.map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs text-gray-600"
                          >
                            <span className="text-gray-800 mr-1">{k}:</span>
                            <span>{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {variants.length > 0 && (
                          <div>
                            {!hasOptions && (
                              <label className="block text-xs text-gray-600 mb-1.5">Variant</label>
                            )}
                            <Controller
                              control={control}
                              name={`items.${index}.variant_id`}
                              render={({ field: { onChange, value } }) =>
                                hasOptions ? (
                                  <VariantSelectors
                                    variants={variants}
                                    value={value}
                                    onChange={(nextVariantId: string) => {
                                      if (
                                        nextVariantId &&
                                        mergeDuplicateIfPresent(index, selectedProductId, nextVariantId)
                                      ) {
                                        return
                                      }
                                      onChange(nextVariantId)
                                    }}
                                  />
                                ) : (
                                  <QuoteSelect
                                    value={value}
                                    onChange={(nextVariantId: string) => {
                                      if (
                                        nextVariantId &&
                                        mergeDuplicateIfPresent(index, selectedProductId, nextVariantId)
                                      ) {
                                        return
                                      }
                                      onChange(nextVariantId)
                                    }}
                                    options={variants}
                                    placeholder="Select variant (optional)"
                                    error={
                                      errors.items &&
                                      Array.isArray(errors.items) &&
                                      (errors.items as any)[index]?.variant_id
                                    }
                                    isLoading={isLoadingVars}
                                  />
                                )
                              }
                            />
                          </div>
                        )}

                        {isLoadingVars && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading options...</span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <label
                          htmlFor={`quote-item-qty-${index}`}
                          className="block text-xs text-gray-600 mb-1.5"
                        >
                          Quantity
                        </label>
                        <Controller
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field: { onChange, value } }) => (
                            <QuantityControl
                              inputId={`quote-item-qty-${index}`}
                              value={Number(value) || 1}
                              onChange={(qty) => onChange(qty)}
                              itemLabel={productMeta?.name || `Item ${index + 1}`}
                            />
                          )}
                        />
                        {rowQuantityError && (
                          <p role="alert" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{rowQuantityError.message as string}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Remove */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove item ${index + 1}`}
                    title="Remove product"
                    className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {errors.items && typeof errors.items.message === 'string' && (
        <p role="alert" className="text-red-600 text-sm flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.items.message}</span>
        </p>
      )}
    </div>
  )
}
