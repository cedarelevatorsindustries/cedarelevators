"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface SEOAutoGenerateButtonProps {
    name: string
    description?: string
    onGenerate: (data: {
        meta_title: string
        meta_description: string
        slug?: string
    }) => void
    disabled?: boolean
    includeSlug?: boolean
    className?: string
}

export function SEOAutoGenerateButton({
    name,
    description = "",
    onGenerate,
    disabled = false,
    includeSlug = false,
    className = ""
}: SEOAutoGenerateButtonProps) {
    const handleGenerate = () => {
        // Generate meta title (use name, truncate to 60 chars)
        const metaTitle = name.length > 60 ? name.substring(0, 60) : name

        // Generate meta description (use first 150-160 chars of description)
        const metaDescription = description
            ? description.substring(0, 150) + (description.length > 150 ? "..." : "")
            : ""

        // Generate slug (lowercase, hyphens, no special chars)
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()

        const result: any = {
            meta_title: metaTitle,
            meta_description: metaDescription
        }

        if (includeSlug) {
            result.slug = slug
        }

        onGenerate(result)
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={disabled || !name}
            className={className}
        >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Defaults
        </Button>
    )
}
