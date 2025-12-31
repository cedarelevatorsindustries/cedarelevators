"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CardPosition = "image-top" | "image-left" | "compact"
export type SortRule = "newest" | "popular" | "manual" | "price-low" | "price-high"

interface DisplayRulesTabProps {
    cardPosition: CardPosition
    onCardPositionChange: (position: CardPosition) => void

    sortRule: SortRule
    onSortRuleChange: (rule: SortRule) => void

    manualPriority?: number
    onManualPriorityChange?: (priority: number) => void

    className?: string
}

export function DisplayRulesTab({
    cardPosition,
    onCardPositionChange,
    sortRule,
    onSortRuleChange,
    manualPriority = 0,
    onManualPriorityChange,
    className
}: DisplayRulesTabProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Product Card Position */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Card Layout</CardTitle>
                    <CardDescription>
                        Choose how products are displayed in this section
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="card-position">Card Position</Label>
                        <Select value={cardPosition} onValueChange={(value) => onCardPositionChange(value as CardPosition)}>
                            <SelectTrigger id="card-position">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image-top">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="w-8 h-5 bg-gray-300 rounded-sm" />
                                            <div className="w-8 h-1 bg-gray-200 rounded" />
                                        </div>
                                        <span>Image Top (Vertical)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="image-left">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-5 h-5 bg-gray-300 rounded-sm" />
                                            <div className="w-3 h-1 bg-gray-200 rounded" />
                                        </div>
                                        <span>Image Left (Horizontal)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="compact">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-4 h-4 bg-gray-300 rounded-sm" />
                                            <div className="w-2 h-0.5 bg-gray-200 rounded" />
                                        </div>
                                        <span>Compact Card</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            This affects how products appear in listings and grids
                        </p>
                    </div>

                    {/* Visual Preview */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-xs font-medium text-gray-700 mb-3">Preview:</p>
                        <div className="bg-white rounded border p-3">
                            {cardPosition === "image-top" && (
                                <div className="space-y-2">
                                    <div className="w-full h-32 bg-gray-200 rounded" />
                                    <div className="space-y-1">
                                        <div className="h-3 bg-gray-300 rounded w-3/4" />
                                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            )}
                            {cardPosition === "image-left" && (
                                <div className="flex gap-3">
                                    <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 bg-gray-300 rounded w-3/4" />
                                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                                        <div className="h-2 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            )}
                            {cardPosition === "compact" && (
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-2 bg-gray-300 rounded w-2/3" />
                                        <div className="h-2 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sort Rules */}
            <Card>
                <CardHeader>
                    <CardTitle>Default Sort Order</CardTitle>
                    <CardDescription>
                        How products should be sorted by default
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sort-rule">Sort Rule</Label>
                        <Select value={sortRule} onValueChange={(value) => onSortRuleChange(value as SortRule)}>
                            <SelectTrigger id="sort-rule">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="manual">Manual Order</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Manual Priority */}
            <Card>
                <CardHeader>
                    <CardTitle>Display Priority</CardTitle>
                    <CardDescription>
                        Control the order in which this item appears
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="manual-priority">Priority Order</Label>
                        <Input
                            id="manual-priority"
                            type="number"
                            min="0"
                            value={manualPriority}
                            onChange={(e) => onManualPriorityChange?.(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-gray-500">
                            Lower numbers appear first. Use this to manually control ordering.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
