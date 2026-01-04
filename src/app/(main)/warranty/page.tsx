import { Metadata } from "next"
import { ShieldCheck, FileText, Wrench, AlertTriangle, HelpCircle } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Warranty Information | Cedar Elevators",
    description: "Learn about our warranty coverage, claim process, and service types.",
}

export default function WarrantyPage() {
    return (
        <div className="bg-white min-h-screen pb-16">
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

                {/* Section 4: FAQs */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <HelpCircle className="text-gray-500" />
                        Common Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is installation mandatory for warranty?</AccordionTrigger>
                            <AccordionContent>
                                For technical items like Motors and Drives, warranty is valid only if installed by a qualified technician. DIY installation errors are not covered.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What voids the warranty?</AccordionTrigger>
                            <AccordionContent>
                                Physical damage, water damage, voltage fluctuations (unless stabilizer used), or unauthorized repairs extend void the warranty.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Who pays for shipping back the defective item?</AccordionTrigger>
                            <AccordionContent>
                                For confirmed manufacturing defects within 7 days, we cover shipping. After that, customer bears one-way shipping.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>

                {/* Service Type / CTA */}
                <section className="bg-gray-900 text-white rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Check warranty by SKU</h3>
                        <p className="text-gray-400 text-sm">Verify status for specific parts.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="text-black border-white hover:bg-gray-100">
                            Enter SKU
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}

