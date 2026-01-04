"use client"

import { useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useCategories } from "@/hooks/queries/useCategories"
import { useApplications } from "@/hooks/queries/useApplications"
import { useCollections } from "@/hooks/queries/useCollections"
import { useElevatorTypes } from "@/hooks/queries/useElevatorTypes"
import type { BannerLinkType } from "@/lib/types/banners"
import { useState } from "react"

interface EntitySelectorProps {
    type: BannerLinkType
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function EntitySelector({ type, value, onChange, disabled }: EntitySelectorProps) {
    const [open, setOpen] = useState(false)

    // Fetch data based on type using hooks
    // Note: Hooks are always called, but we only use the data relevant to the selected type
    const { data: categoriesData, isLoading: isLoadingCategories } = useCategories()
    const { data: applicationsData, isLoading: isLoadingApplications } = useApplications()
    const { data: collectionsData, isLoading: isLoadingCollections } = useCollections()
    const { data: elevatorTypesData, isLoading: isLoadingElevatorTypes } = useElevatorTypes()

    // Normalize options based on type
    const options = useMemo(() => {
        if (!type) return []

        switch (type) {
            case 'category':
                return categoriesData?.categories.map(c => ({
                    label: c.name,
                    value: c.id
                })) || []

            case 'application':
                return applicationsData?.applications.map(a => ({
                    label: a.name, // Application uses name
                    value: a.id
                })) || []

            case 'collection':
                return collectionsData?.collections.map(c => ({
                    label: c.title, // Collection uses title
                    value: c.id
                })) || []

            case 'elevator-type':
                // useElevatorTypes returns FetchElevatorTypesResult with elevatorTypes array
                return (elevatorTypesData?.elevatorTypes || []).map((t: any) => ({
                    label: t.name,
                    value: t.id
                }))

            default:
                return []
        }
    }, [type, categoriesData, applicationsData, collectionsData, elevatorTypesData])

    const isLoading =
        (type === 'category' && isLoadingCategories) ||
        (type === 'application' && isLoadingApplications) ||
        (type === 'collection' && isLoadingCollections) ||
        (type === 'elevator-type' && isLoadingElevatorTypes)

    // Find label for current value
    const selectedLabel = options.find((option: { label: string; value: string }) => option.value === value)?.label

    if (!type) {
        return (
            <div className="space-y-2">
                <Label>Link Target</Label>
                <div className="text-sm text-gray-500 italic p-2 border rounded-md bg-gray-50">
                    Please select a Link Type first
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Label>Link Target *</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled || isLoading}
                    >
                        {value ? selectedLabel || "Select item..." : "Select item..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder={`Search ${type}...`} />
                        <CommandList>
                            <CommandEmpty>No {type} found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option: { label: string; value: string }) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => {
                                            onChange(option.value === value ? "" : option.value)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {isLoading && <p className="text-xs text-orange-500">Loading {type}s...</p>}
            {!value && !isLoading && (
                <p className="text-xs text-gray-500">
                    Select the specific {type} this banner should link to
                </p>
            )}
        </div>
    )
}

