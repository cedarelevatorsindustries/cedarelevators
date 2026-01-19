import { Metadata } from "next"
import { PolicyNavigation } from "@/components/policies/PolicyNavigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPolicyByTypeAction } from "@/lib/actions/policies-cms"

export const metadata: Metadata = {
    title: "Privacy Policy | Cedar Elevators",
    description: "Learn how Cedar Elevators protects your privacy and handles your data.",
}

export default async function PrivacyPolicyPage() {
    // Fetch policy data from CMS
    const { data: policy } = await getPolicyByTypeAction('privacy')

    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Top padding for navbar */}
            <div className="h-[70px] md:h-[80px]" />

            {/* Header - Center Aligned */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {policy?.title || 'Privacy Policy'}
                    </h1>
                    <p className="text-orange-600 font-medium">
                        Last Updated: {policy?.last_updated ? new Date(policy.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'October 2023'}
                    </p>
                </div>
            </div>

            {/* Policy Navigation Tabs */}
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <PolicyNavigation />
            </div>

            {/* Content - All sections displayed sequentially */}
            <div className="container mx-auto max-w-6xl px-4 space-y-12">
                {policy?.content && policy.content.length > 0 ? (
                    policy.content.map((section, index) => (
                        <section key={section.id || index}>
                            <h2 className="text-2xl font-bold text-orange-600 mb-4">{section.title}</h2>

                            {/* Paragraph */}
                            {section.content_type === 'paragraph' && (
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {section.content}
                                </div>
                            )}

                            {/* Bullet List */}
                            {section.content_type === 'bullet' && section.items && (
                                <ul className="space-y-3">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                                            <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Numbered List */}
                            {section.content_type === 'numbered' && section.items && (
                                <ol className="space-y-3">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                                            <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600 font-semibold text-sm">
                                                {idx + 1}
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}

                            {/* Table */}
                            {section.content_type === 'table' && section.table_data && (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                {section.table_data.headers.map((header, idx) => (
                                                    <th key={idx} className="border border-gray-300 px-4 py-3 text-left font-semibold">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.table_data.rows.map((row, rowIdx) => (
                                                <tr key={rowIdx} className={rowIdx % 2 === 1 ? 'bg-gray-50' : ''}>
                                                    {row.map((cell, cellIdx) => (
                                                        <td key={cellIdx} className="border border-gray-300 px-4 py-3">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    ))
                ) : (
                    <section>
                        <h2 className="text-2xl font-bold text-orange-600 mb-4">Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Content coming soon. Please check back later.
                        </p>
                    </section>
                )}
            </div>

            {/* CTA Section */}
            <div className="container mx-auto max-w-6xl px-4 mt-16">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 text-center border border-orange-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Have Questions About Your Privacy?</h3>
                    <p className="text-gray-600 mb-6">Our team is here to help you understand how we protect your data.</p>
                    <Link href="/contact">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
