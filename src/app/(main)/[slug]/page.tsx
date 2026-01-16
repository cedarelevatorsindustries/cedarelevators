import { getCMSPageBySlug } from "@/lib/actions/cms"
import { getSlugFromPath } from "@/lib/utils/cms-utils"
import { CMSEmptyState } from "@/components/ui/cms-empty-state"
import { Metadata } from "next"
import { notFound } from "next/navigation"

const VALID_PATHS = [
    "/about",
    "/why-choose",
    "/warranty",
    "/privacy",
    "/terms",
    "/return-policy",
    "/shipping-policy"
]

interface PolicyPageProps {
    params: {
        slug: string
    }
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
    const path = `/${params.slug}`
    const slug = getSlugFromPath(path)
    const page = await getCMSPageBySlug(slug)

    if (!page) {
        return {
            title: "Page Not Found | Cedar Elevator Industries"
        }
    }

    return {
        title: page.seo_title || `${page.title} | Cedar Elevator Industries`,
        description: page.seo_description || page.hero_subtitle || `${page.title} - Cedar Elevator Industries`
    }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
    const path = `/${params.slug}`

    // Validate path
    if (!VALID_PATHS.includes(path)) {
        notFound()
    }

    const slug = getSlugFromPath(path)
    const page = await getCMSPageBySlug(slug)

    if (!page) {
        notFound()
    }

    // Show empty state if content is not available
    if (!page.content || !page.is_published) {
        return <CMSEmptyState pageTitle={page.title} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">
                        {page.title}
                    </h1>
                    {page.hero_subtitle && (
                        <p className="text-xl text-blue-100">
                            {page.hero_subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
                    {/* Content Body */}
                    <div
                        className="prose prose-lg prose-gray max-w-none 
                                   prose-headings:font-bold prose-headings:text-gray-900
                                   prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200
                                   prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                                   prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                                   prose-li:text-gray-700 prose-li:leading-relaxed
                                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                   prose-strong:text-gray-900 prose-strong:font-semibold
                                   prose-table:border-collapse 
                                   prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:text-left
                                   prose-td:border prose-td:border-gray-300 prose-td:p-3
                                   prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />

                    {/* Last Updated Footer */}
                    {page.show_last_updated && (
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Generate static params for all valid paths
export async function generateStaticParams() {
    return VALID_PATHS.map(path => ({
        slug: path.replace("/", "")
    }))
}
