"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface SortOption {
    value: string
    label: string
}

interface SortFilterProps {
    value: string
    onChange: (value: string) => void
}

const sortOptions: SortOption[] = [
    { value: 'default', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' }
]

export function SortFilter({ value, onChange }: SortFilterProps) {
    return (
        <RadioGroup value={value} onValueChange={onChange}>
            <div className="space-y-2">
                {sortOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                        <Label
                            htmlFor={`sort-${option.value}`}
                            className="text-sm font-normal cursor-pointer"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </RadioGroup>
    )
}
