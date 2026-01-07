import { Badge } from "@/components/ui/badge"
import { FolderTree } from "lucide-react"

interface CategoryPreviewProps {
    name: string
    description?: string
    imageUrl?: string
    status?: string
}

export function CategoryPreview({
    name,
    description,
    imageUrl,
    status = "draft"
}: CategoryPreviewProps) {
    return (
        <div className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-[280px]">

            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FolderTree className="h-20 w-20 text-blue-300" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                    {name || "Category Name"}
                </h3>
                {description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {description}
                    </p>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <Badge
                        variant="outline"
                        className={
                            status === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : status === "draft"
                                    ? "bg-gray-50 text-gray-700 border-gray-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                        }
                    >
                        {status}
                    </Badge>
                </div>
            </div>
        </div>
    )
}
