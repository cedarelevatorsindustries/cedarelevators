"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Eye, Copy, Archive, Save, LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RightContextPanelProps {
    // Status
    status: "draft" | "active" | "archived"
    onStatusChange?: (status: "draft" | "active" | "archived") => void

    // Timestamps
    createdAt?: string
    updatedAt?: string

    // Linked items
    linkedItems?: {
        label: string
        count: number
        href?: string
    }[]

    // Quick actions
    onView?: () => void
    onDuplicate?: () => void
    onArchive?: () => void

    // Save button
    onSave: () => void
    isSaving?: boolean
    saveLabel?: string

    // Additional content
    children?: ReactNode
    className?: string
}

export function RightContextPanel({
    status,
    onStatusChange,
    createdAt,
    updatedAt,
    linkedItems,
    onView,
    onDuplicate,
    onArchive,
    onSave,
    isSaving = false,
    saveLabel = "Save Changes",
    children,
    className
}: RightContextPanelProps) {
    const statusColors = {
        draft: "bg-gray-100 text-gray-800 border-gray-200",
        active: "bg-green-100 text-green-800 border-green-200",
        archived: "bg-red-100 text-red-800 border-red-200"
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {(["draft", "active", "archived"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => onStatusChange?.(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors capitalize",
                                    status === s
                                        ? statusColors[s]
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Timestamps */}
                    {(createdAt || updatedAt) && (
                        <div className="pt-4 border-t space-y-2 text-xs text-gray-500">
                            {createdAt && (
                                <div className="flex justify-between">
                                    <span>Created:</span>
                                    <span className="font-medium text-gray-700">{new Date(createdAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {updatedAt && (
                                <div className="flex justify-between">
                                    <span>Updated:</span>
                                    <span className="font-medium text-gray-700">{new Date(updatedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Linked Items */}
            {linkedItems && linkedItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Linked Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {linkedItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{item.label}</span>
                                <Badge variant="secondary" className="font-semibold">
                                    {item.count}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            {(onView || onDuplicate || onArchive) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {onView && (
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={onView}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Live
                            </Button>
                        )}
                        {onDuplicate && (
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={onDuplicate}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </Button>
                        )}
                        {onArchive && (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={onArchive}
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Additional Content */}
            {children}

            {/* Save Button - Sticky at bottom */}
            <div className="sticky bottom-6">
                <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {saveLabel}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

