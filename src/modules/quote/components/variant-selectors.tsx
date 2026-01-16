'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QuoteSelect } from './quote-select';

interface VariantSelectorsProps {
    variants: any[];
    value: string;
    onChange: (value: string) => void;
}

export function VariantSelectors({ variants, value, onChange }: VariantSelectorsProps) {
    // 1. Extract unique option keys
    const optionKeys = useMemo(() => {
        const keys = new Set<string>();
        variants.forEach(v => {
            if (v.options) {
                Object.keys(v.options).forEach(k => keys.add(k));
            }
        });
        return Array.from(keys);
    }, [variants]);

    // 2. State for selections
    const [selections, setSelections] = useState<Record<string, string>>({});

    // 3. Sync state with external value (when loading saved draft or prefill)
    useEffect(() => {
        if (value && variants.length > 0) {
            const variant = variants.find(v => v.value === value);

            if (variant && variant.options) {
                // Ensure we only set keys that exist in our optionKeys
                const validSelections: Record<string, string> = {};
                optionKeys.forEach(key => {
                    if (variant.options[key]) {
                        validSelections[key] = variant.options[key];
                    }
                });

                // Only update if different to avoid loop
                setSelections(prev => {
                    const isDifferent = Object.keys(validSelections).some(k => validSelections[k] !== prev[k]);
                    return isDifferent ? validSelections : prev;
                });
            }
        } else if (!value && variants.length > 0) {
            // Only clear selections if value is explicitly cleared (not just empty on mount)
            setSelections({});
        }
    }, [value, variants, optionKeys]);

    // DO NOT reset selections when variants change - this was causing the bug!
    // The above useEffect handles both initial load and variant changes

    // 4. Handle Change
    const handleOptionChange = (key: string, val: string) => {
        const newSelections = { ...selections, [key]: val };
        setSelections(newSelections);

        // Try to find matching variant
        const isComplete = optionKeys.every(k => newSelections[k]);

        if (isComplete) {
            const matchingVariant = variants.find(v => {
                const vOpts = v.options || {};
                return optionKeys.every(k => vOpts[k] === newSelections[k]);
            });

            if (matchingVariant) {
                onChange(matchingVariant.value);
            } else {
                onChange(''); // Invalid combination
            }
        } else {
            onChange(''); // Incomplete selection
        }
    };

    if (optionKeys.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Variant Options</h3>
                <span className="text-xs text-gray-500">{optionKeys.length} options</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {optionKeys.map(key => {
                    // Get unique values for this key
                    const values = Array.from(new Set(variants.map(v => v.options?.[key]).filter(Boolean))).sort();

                    return (
                        <div key={key}>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 capitalize">{key} <span className="text-red-500">*</span></label>
                            <QuoteSelect
                                value={selections[key] || ''}
                                onChange={(val) => handleOptionChange(key, val)}
                                options={values.map(v => ({ label: v as string, value: v as string }))}
                                placeholder={`Select ${key}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
