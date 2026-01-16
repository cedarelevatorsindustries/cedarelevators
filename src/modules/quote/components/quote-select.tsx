'use client';

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown } from 'lucide-react';

interface QuoteSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; price?: number }[];
    placeholder: string;
    error?: any;
    onSearch?: (query: string) => void;
    isLoading?: boolean;
}

export function QuoteSelect({ value, onChange, options, placeholder, error, onSearch, isLoading }: QuoteSelectProps) {
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
                        {onSearch && (
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
                        )}

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
                                    {isLoading ? 'Searching...' : 'No products/options found'}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
