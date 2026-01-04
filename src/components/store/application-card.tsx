'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApplicationCardProps {
    name: string
    slug: string
    description?: string
    icon: LucideIcon
    categoryCount: number
    productCount?: number
    image_url?: string
    className?: string
}

export function ApplicationCard({
    name,
    slug,
    description,
    icon: Icon,
    categoryCount,
    productCount,
    image_url,
    className
}: ApplicationCardProps) {
    return (
        <Link href={`/products?app=${slug}`}>
            <Card className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                "border-2 hover:border-orange-400",
                className
            )}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* Icon/Image */}
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all">
                            {image_url ? (
                                <img
                                    src={image_url}
                                    alt={name}
                                    className="w-12 h-12 object-contain"
                                />
                            ) : (
                                <Icon className="w-10 h-10 text-orange-600" />
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {name}
                        </h3>

                        {/* Description */}
                        {description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 pt-2">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                                {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
                            </Badge>
                            {productCount !== undefined && (
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                    {productCount} Products
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

