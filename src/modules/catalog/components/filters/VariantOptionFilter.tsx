"use client"

import { FilterGroup } from "./FilterGroup"
import { CheckboxFilter } from "./CheckboxFilter"

interface VariantOptionFilterProps {
    optionName: string
    options: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    counts?: Record<string, number>
}

export function VariantOptionFilter({
    optionName,
    options,
    selected,
    onChange,
    counts
}: VariantOptionFilterProps) {
    return (
        <CheckboxFilter
            options={options.map(value => ({
                value,
                label: value,
                count: counts?.[value]
            }))}
            selectedValues={selected}
            onChange={onChange}
        />
    )
}
