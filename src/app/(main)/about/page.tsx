import { getStoreSettings } from "@/lib/services/settings"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: "About Us | Cedar Elevators",
    description: "Learn more about Cedar Elevators and our mission.",
}

export default async function AboutPage() {
    const { data: settings } = await getStoreSettings()

    if (!settings) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <div className="space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                        About {settings.store_name}
                    </h1>
                    {settings.description && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {settings.description}
                        </p>
                    )}
                </div>

                <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {settings.about_cedar || "No description available."}
                </div>
            </div>
        </div>
    )
}
