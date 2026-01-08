'use client';

import React, { useState, useEffect } from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors, Controller } from 'react-hook-form';
import { Plus, X, Package, ChevronDown, AlertCircle, Search, Loader2 } from 'lucide-react';
import { UserType } from '../types';
import { getProductsForQuote, searchProductsForQuote, ProductOption } from '@/lib/actions/quote-products';

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
}

// Custom Dropdown Component with Search
function CustomSelect({ value, onChange, options, placeholder, error, onSearch, isLoading }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const selectedOption = options.find((opt: any) => opt.value === value);

    const filteredOptions = searchQuery
        ? options.filter((opt: any) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
            >
                <span className={selectedOption ? 'text-gray-900 truncate' : 'text-gray-500'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (onSearch) {
                                            onSearch(e.target.value);
                                        }
                                    }}
                                    placeholder="Search products..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {isLoading && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option: any) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors text-sm ${value === option.value ? 'bg-orange-100 text-orange-900 font-medium' : 'text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{option.label}</span>
                                            {option.price && (
                                                <span className="text-xs text-gray-500 ml-2">₹{option.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    {isLoading ? 'Searching...' : 'No products found'}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function QuoteItemsInput({ control, register, errors, userType, prefilledProduct }: QuoteItemsInputProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const isGuest = userType === 'guest';
    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Load initial products
    useEffect(() => {
        loadProducts();
    }, []);

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

    // Guest User - Single Product Selection
    if (isGuest) {
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
                            <CustomSelect
                                value={value}
                                onChange={onChange}
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
                </div>

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
                {fields.map((field, index) => (
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
                                            <CustomSelect
                                                value={value}
                                                onChange={onChange}
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
                ))}
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
