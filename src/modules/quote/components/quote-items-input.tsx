'use client';

import React, { useState, useEffect } from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors, Controller, UseFormSetValue, UseFormSetError, UseFormClearErrors, UseFormWatch } from 'react-hook-form';
import { Plus, X, Package, AlertCircle, Loader2 } from 'lucide-react';
import { UserType } from '../types';
import { getProductsForQuote, searchProductsForQuote, getProductVariants, ProductOption } from '@/lib/actions/quote-products';
import { QuoteSelect } from './quote-select';
import { VariantSelectors } from './variant-selectors';
import { PricingVisibility } from './pricing-visibility';

interface QuoteItemsInputProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    userType: UserType | 'verified' | string;
    prefilledProduct?: {
        id: string;
        name: string;
        sku?: string;
        price?: number;
    } | null;
    setValue: UseFormSetValue<any>;
    setError: UseFormSetError<any>;
    clearErrors: UseFormClearErrors<any>;
    watch: UseFormWatch<any>;
    verificationStatus?: string | null;
}

export function QuoteItemsInput({ control, register, errors, userType, prefilledProduct, setValue, setError, clearErrors, watch, verificationStatus }: QuoteItemsInputProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const isGuest = userType === 'guest';
    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Variant state - track variants for each item by index (and for guest user)
    const [variantOptionsMap, setVariantOptionsMap] = useState<Map<number, any[]>>(new Map());
    const [loadingVariantsMap, setLoadingVariantsMap] = useState<Map<number, boolean>>(new Map());

    // Guest user variant state
    const [guestVariants, setGuestVariants] = useState<any[]>([]);
    const [isLoadingGuestVariants, setIsLoadingGuestVariants] = useState(false);

    // Validation Effects
    const guestVariantId = watch('variant_id');
    const items = watch('items');

    // Validate Guest Variant
    useEffect(() => {
        if (!isGuest || !guestVariants.length) {
            if (isGuest) clearErrors('variant_id');
            return;
        }

        if (!guestVariantId) {
            setError('variant_id', {
                type: 'manual',
                message: 'Please select a variant'
            });
        } else {
            clearErrors('variant_id');
        }
    }, [isGuest, guestVariants, guestVariantId, setError, clearErrors]);

    // Note: Removed aggressive validation for items variants
    // Validation is now handled by react-hook-form's built-in validation on submit
    // This prevents showing errors immediately when variants load

    // Load initial products
    useEffect(() => {
        loadProducts();
    }, []);

    // Load variants for prefilled product (both guest and logged-in users)
    useEffect(() => {
        if (prefilledProduct?.id) {
            if (isGuest) {
                // Load variants for guest user
                loadGuestVariants(prefilledProduct.id);
            } else {
                // Load variants for first item (index 0) for logged-in users
                loadVariants(prefilledProduct.id, 0);
            }
        }
    }, [prefilledProduct?.id, isGuest]);

    const loadProducts = async (query?: string) => {
        setIsLoadingProducts(true);
        const result = query
            ? await searchProductsForQuote(query)
            : await getProductsForQuote();

        if (result.success && result.products) {
            let products = result.products;

            // If we have a prefilled product and no query (initial load), ensure it's in the list
            if (!query && prefilledProduct) {
                const exists = products.some(p => p.value === prefilledProduct.id);
                if (!exists) {
                    const prefilledOption: ProductOption = {
                        value: prefilledProduct.id,
                        label: prefilledProduct.name,
                        sku: prefilledProduct.sku || '',
                        price: prefilledProduct.price
                    };
                    products = [prefilledOption, ...products];
                }
            }

            setProductOptions(products);
        }
        setIsLoadingProducts(false);
    };

    const handleSearch = (query: string) => {
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Debounce search
        const timeout = setTimeout(() => {
            loadProducts(query);
        }, 300);

        setSearchTimeout(timeout);
    };

    // Load variants for a specific product (called when product is selected)
    const loadVariants = async (productId: string, index: number) => {
        if (!productId) {
            // Clear variants for this index
            setVariantOptionsMap(prev => {
                const newMap = new Map(prev);
                newMap.delete(index);
                return newMap;
            });
            return;
        }

        // Set loading state
        setLoadingVariantsMap(prev => {
            const newMap = new Map(prev);
            newMap.set(index, true);
            return newMap;
        });

        const result = await getProductVariants(productId);

        if (result.success && result.variants) {
            setVariantOptionsMap(prev => {
                const newMap = new Map(prev);
                newMap.set(index, result.variants || []);
                return newMap;
            });
        }

        setLoadingVariantsMap(prev => {
            const newMap = new Map(prev);
            newMap.set(index, false);
            return newMap;
        });
    };

    // Load variants for guest user
    const loadGuestVariants = async (productId: string) => {
        if (!productId) {
            setGuestVariants([]);
            return;
        }

        setIsLoadingGuestVariants(true);
        const result = await getProductVariants(productId);

        if (result.success && result.variants) {
            setGuestVariants(result.variants || []);
        } else {
            setGuestVariants([]);
        }

        setIsLoadingGuestVariants(false);
    };

    // Guest User - Single Product Selection
    if (isGuest) {
        const hasOptions = guestVariants.some(v => v.options && Object.keys(v.options).length > 0);

        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        control={control}
                        name="product_id"
                        render={({ field: { onChange, value } }) => (
                            <QuoteSelect
                                value={value}
                                onChange={(newValue: string) => {
                                    onChange(newValue);
                                    // Reset variant when product changes
                                    setValue('variant_id', '');
                                    // Load variants when product changes
                                    loadGuestVariants(newValue);
                                }}
                                options={productOptions}
                                placeholder="Select a product"
                                error={errors.product_id}
                                onSearch={handleSearch}
                                isLoading={isLoadingProducts}
                            />
                        )}
                    />
                    {errors.product_id && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.product_id.message as string}
                        </p>
                    )}

                    {/* Price visibility indicator */}
                    {watch('product_id') && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <PricingVisibility
                                userType={userType}
                                verificationStatus={verificationStatus}
                                price={productOptions.find(p => p.value === watch('product_id'))?.price}
                            />
                        </div>
                    )}
                </div>

                {/* Variant Selection - Shows when product has variants */}
                {guestVariants.length > 0 && (
                    <div>
                        {!hasOptions && (
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Variant <span className="text-red-500">*</span>
                            </label>
                        )}

                        <Controller
                            control={control}
                            name="variant_id"
                            render={({ field: { onChange, value } }) => (
                                hasOptions ? (
                                    <VariantSelectors
                                        variants={guestVariants}
                                        value={value}
                                        onChange={onChange}
                                    />
                                ) : (
                                    <QuoteSelect
                                        value={value}
                                        onChange={onChange}
                                        options={guestVariants}
                                        placeholder="Select variant"
                                        error={errors.variant_id}
                                        isLoading={isLoadingGuestVariants}
                                    />
                                )
                            )}
                        />
                        {errors.variant_id && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.variant_id.message as string}
                            </p>
                        )}
                    </div>
                )}
                {isLoadingGuestVariants && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading variants...
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        {...register("quantity", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        placeholder="Enter quantity"
                        min={1}
                    />
                    {errors.quantity && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.quantity.message as string}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Individual/Business Users - Multiple Products
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Products</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Add all items you need for this quote</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ product_id: "", quantity: 1 })}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => {
                    const variants = variantOptionsMap.get(index) || [];
                    const hasOptions = variants.some((v: any) => v.options && Object.keys(v.options).length > 0);

                    return (
                        <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                            <div className="flex gap-4 items-start">
                                {/* Product Icon */}
                                <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>

                                {/* Product Selection */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Product {index + 1}
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`items.${index}.product_id`}
                                            render={({ field: { onChange, value } }) => (
                                                <QuoteSelect
                                                    value={value}
                                                    onChange={(newValue: string) => {
                                                        onChange(newValue);
                                                        // Reset variant when product changes
                                                        setValue(`items.${index}.variant_id`, '');
                                                        // Load variants when product changes
                                                        loadVariants(newValue, index);
                                                    }}
                                                    options={productOptions}
                                                    placeholder="Select product"
                                                    error={errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.product_id}
                                                    onSearch={handleSearch}
                                                    isLoading={isLoadingProducts}
                                                />
                                            )}
                                        />
                                        {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.product_id && (
                                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {((errors.items as any)[index]?.product_id?.message as string)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Variant Selection - Shows when product has variants */}
                                    {variants.length > 0 && (
                                        <div>
                                            {!hasOptions && (
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Variant <span className="text-red-500">*</span>
                                                </label>
                                            )}
                                            <Controller
                                                control={control}
                                                name={`items.${index}.variant_id`}
                                                render={({ field: { onChange, value } }) => (
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
                                                            placeholder="Select variant"
                                                            error={errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.variant_id}
                                                            isLoading={loadingVariantsMap.get(index) || false}
                                                        />
                                                    )
                                                )}
                                            />
                                            {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.variant_id && (
                                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {((errors.items as any)[index]?.variant_id?.message as string)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {loadingVariantsMap.get(index) && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Loading variants...
                                        </p>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                                            placeholder="Qty"
                                            min={1}
                                        />
                                        {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.quantity && (
                                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {((errors.items as any)[index]?.quantity?.message as string)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remove item"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {errors.items && typeof errors.items.message === 'string' && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.items.message}
                </p>
            )}

            {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No items added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Item" to get started</p>
                </div>
            )}
        </div>
    );
}
