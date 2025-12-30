import { Metadata } from "next"
import { getPublishedPolicyBySlug } from "@/lib/services/cms"
import { notFound } from "next/navigation"

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const { data: policy } = await getPublishedPolicyBySlug(slug)

    if (!policy) {
        return {
            title: "Policy Not Found",
        }
    }

    return {
        title: `${policy.title} | Cedar Elevators`,
        description: policy.meta_description || `Read our ${policy.title}`,
    }
}

export default async function PolicyPage({ params }: Props) {
    const { slug } = await params
    const { data: policy } = await getPublishedPolicyBySlug(slug)

    if (!policy) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <article className="space-y-8">
                <header className="text-center space-y-4 border-b border-gray-100 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                        {policy.title}
                    </h1>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                    </div>
                </header>

                <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {policy.content}
                </div>
            </article>
        </div>
    )
}
