import { Metadata } from "next"
import { ShieldCheck, FileText, AlertTriangle, Info } from "lucide-react"

export const metadata: Metadata = {
    title: "Warranty Information | Cedar Elevators",
    description: "Learn about our warranty coverage, claim process, and service types.",
}

export default function WarrantyPage() {
    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Add top padding to prevent navbar overlap */}
            <div className="h-[70px] md:h-[80px]" />

            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        Warranty Information
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Peace of mind included. Simple, transparent coverage for your components.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-12 space-y-16">
                {/* Warranty Period Card - ADDED */}
                <section>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold text-blue-600 mb-3">
                            12 Months
                        </h2>
                        <p className="text-lg text-gray-600 font-medium mb-6 uppercase tracking-wide">
                            WARRANTY PERIOD
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                <span className="font-medium">Type: Limited Manufacturing Warranty</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                <span className="font-medium">Applies to: All Cedar Components</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 1: Coverage Table */}
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
                                <tr>
                                    <td className="px-6 py-4 font-medium">Motors & Machines</td>
                                    <td className="px-6 py-4">2 Years</td>
                                    <td className="px-6 py-4 text-gray-600">Manufacturing defects, coil failure</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Control Panels (PCBs)</td>
                                    <td className="px-6 py-4">1 Year</td>
                                    <td className="px-6 py-4 text-gray-600">Component failure, software bugs</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Mechanical Parts (Rails, etc)</td>
                                    <td className="px-6 py-4">5 Years</td>
                                    <td className="px-6 py-4 text-gray-600">Rust (if indoor), structural failure</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Consumables (Oils, Buttons)</td>
                                    <td className="px-6 py-4">No Warranty</td>
                                    <td className="px-6 py-4 text-gray-600">Tested ok on delivery</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 2: Claim Process */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <FileText className="text-orange-600" />
                        How to Claim
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { step: "1", title: "Report Issue", desc: "Contact support with Order ID and description." },
                            { step: "2", title: "Submit Proof", desc: "Send photos/videos of the defect." },
                            { step: "3", title: "Resolution", desc: "Repair or Replacement provided (7-10 days)." }
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-gray-500">{item.step}</div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-2 relative z-10">{item.title}</h3>
                                <p className="text-gray-600 relative z-10">{item.desc}</p>
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
