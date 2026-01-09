"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface RadioOption {
    value: string
    label: string
    count?: number
}

interface RadioFilterProps {
    options: RadioOption[]
    selectedValue?: string
    onChange: (value: string) => void
}

export function RadioFilter({ options, selectedValue, onChange }: RadioFilterProps) {
    return (
        <RadioGroup value={selectedValue} onValueChange={onChange}>
            <div className="space-y-2">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`radio-${option.value}`} />
                            <Label
                                htmlFor={`radio-${option.value}`}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {option.label}
                            </Label>
                        </div>
                        {option.count !== undefined && (
                            <span className="text-xs text-gray-500">({option.count})</span>
                        )}
                    </div>
                ))}
            </div>
        </RadioGroup>
    )
}
