'use client';

import React from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserType } from '../types';

interface QuoteItemsInputProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    userType: UserType | 'verified' | string;
}

export function QuoteItemsInput({ control, register, errors, userType }: QuoteItemsInputProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const isGuest = userType === 'guest';
    const isMultiItem = !isGuest;

    // For Guest, we don't use FieldArray usually, or maybe we do for consistency but limit to 1?
    // Based on schema `guestQuoteSchema`: product_id, quantity, etc. are root level, NOT in `items` array.
    // So this component might only be for Individual/Business.

    // However, keeping one form component is the goal. 
    // If Guest, we render simple inputs. 
    // If Individual/Business, we render array inputs.

    if (isGuest) {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700">Product</label>
                    <select
                        {...register("product_id")}
                        className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange"
                    >
                        <option value="">Select a Product</option>
                        <option value="prod_123">Elevator Model X</option>
                        <option value="prod_456">Elevator Model Y</option>
                        {/* Should fetch products dynamically */}
                    </select>
                    {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id.message as string}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Quantity</label>
                    <input
                        type="number"
                        {...register("quantity")}
                        className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange"
                        min={1}
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message as string}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-neutral-700">Items Needed</label>
                <button
                    type="button"
                    onClick={() => append({ product_id: "", quantity: 1 })}
                    className="text-sm text-cedar-orange font-medium hover:text-orange-700"
                >
                    + Add Item
                </button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start bg-neutral-50 p-3 rounded-md border border-neutral-200">
                    <div className="flex-1">
                        <select
                            {...register(`items.${index}.product_id` as const)}
                            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange text-sm"
                        >
                            <option value="">Select Product</option>
                            <option value="prod_123">Elevator Model X</option>
                            <option value="prod_456">Elevator Model Y</option>
                        </select>
                        {/* Type assertion needed because dynamic path */}
                        {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.product_id && (
                            <p className="text-red-500 text-xs mt-1">{((errors.items as any)[index]?.product_id?.message as string)}</p>
                        )}
                    </div>

                    <div className="w-24">
                        <input
                            type="number"
                            {...register(`items.${index}.quantity` as const)}
                            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange text-sm"
                            placeholder="Qty"
                            min={1}
                        />
                        {errors.items && Array.isArray(errors.items) && (errors.items as any)[index]?.quantity && (
                            <p className="text-red-500 text-xs mt-1">{((errors.items as any)[index]?.quantity?.message as string)}</p>
                        )}
                    </div>

                    {fields.length > 1 && (
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-neutral-400 hover:text-red-500 mt-2"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
            {errors.items && <p className="text-red-500 text-sm">{errors.items.message as string}</p>}
        </div>
    );
}
