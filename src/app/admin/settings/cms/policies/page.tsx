import { getAllCMSPages } from "@/lib/actions/admin-cms"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Edit, ExternalLink, Shield } from "lucide-react"

export const metadata = {
    title: "Policies | Admin"
}

export default async function PoliciesPage() {
    const pages = await getAllCMSPages()

    // Filter to show only the 4 policy pages
    const policies = pages.filter(p =>
        ['privacy-policy', 'terms-conditions', 'return-policy', 'shipping-policy'].includes(p.slug)
    )

    // Map slugs to friendly IDs for routing
    const slugToId: Record<string, string> = {
        'privacy-policy': 'privacy',
        'terms-conditions': 'terms',
        'return-policy': 'return',
        'shipping-policy': 'shipping'
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage store policies and legal documents
                </p>
            </div>

            {/* 4 Policy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {policies.map((policy) => (
                    <div
                        key={policy.id}
                        className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {policy.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        /{policy.slug.replace('-policy', '').replace('-', ' ')}
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant={policy.is_published ? "default" : "secondary"}
                                className={
                                    policy.is_published
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-gray-100 text-gray-800"
                                }
                            >
                                {policy.is_published ? "Published" : "Draft"}
                            </Badge>
                        </div>

                        {policy.hero_subtitle && (
                            <p className="text-sm text-gray-600 mb-4">
                                {policy.hero_subtitle}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Updated {new Date(policy.updated_at).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-2">
                                {policy.is_published && (
                                    <Link
                                        href={`/${policy.slug.replace('-policy', '').replace('-', '-')}`}
                                        target="_blank"
                                        className="text-gray-400 hover:text-gray-600"
                                        title="View published page"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                )}
                                <Link
                                    href={`/admin/settings/cms/policies/${slugToId[policy.slug]}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
