import { Metadata } from "next"
import { ShieldCheck, FileText, AlertTriangle } from "lucide-react"
import { getWarrantyDataAction } from "@/lib/actions/warranty-cms"

export const metadata: Metadata = {
    title: "Warranty Information | Cedar Elevators",
    description: "Learn about our warranty coverage, claim process, and service types.",
}

export default async function WarrantyPage() {
    // Fetch CMS data
    const { data } = await getWarrantyDataAction()

    const hero = data?.hero || { title: "Warranty Information", description: "Peace of mind included. Simple, transparent coverage for your components." }
    const period = data?.period || { months: 12, warranty_type: "Limited Manufacturing Warranty", applies_to: "All Cedar Components" }
    const coverage = data?.coverage || []
    const claimSteps = data?.claimSteps || [
        { step_number: 1, title: "Report Issue", description: "Contact support with Order ID and description." },
        { step_number: 2, title: "Submit Proof", description: "Send photos/videos of the defect." },
        { step_number: 3, title: "Resolution", description: "Repair or Replacement provided (7-10 days)." }
    ]

    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Add top padding to prevent navbar overlap */}
            <div className="h-[70px] md:h-[80px]" />

            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        {hero.title}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {hero.description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-12 space-y-16">
                {/* Warranty Period Card - Dynamic from CMS */}
                <section>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold text-blue-600 mb-3">
                            {period.months} Months
                        </h2>
                        <p className="text-lg text-gray-600 font-medium mb-6 uppercase tracking-wide">
                            WARRANTY PERIOD
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                <span className="font-medium">Type: {period.warranty_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                <span className="font-medium">Applies to: {period.applies_to}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coverage Table - Dynamic from CMS */}
                {coverage.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-green-600" />
                            Warranty Coverage
                        </h2>
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Product Category</th>
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4">Coverage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {coverage.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 font-medium">{item.reference_name}</td>
                                            <td className="px-6 py-4">{item.duration}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.coverage_text}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Claim Process - Dynamic from CMS */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <FileText className="text-orange-600" />
                        How to Claim
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {claimSteps.map((item, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-gray-500">{item.step_number}</div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-2 relative z-10">{item.title}</h3>
                                <p className="text-gray-600 relative z-10">{item.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>Valid Invoice and Serial Number required for all claims.</span>
                    </div>
                </section>
            </div>
        </div>
    )
}
