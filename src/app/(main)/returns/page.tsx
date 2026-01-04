import { Metadata } from "next"
import { CheckCircle2, XCircle, RefreshCw, FileText, Truck, Wallet } from "lucide-react"

export const metadata: Metadata = {
    title: "Returns & Refunds | Cedar Elevators",
    description: "Understand our return policy, eligibility, and refund process.",
}

export default function ReturnsPage() {
    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        Returns & Refunds
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Review how returns work. We aim for transparency so you can shop with confidence.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-12 space-y-16">
                {/* Section 1: Return Eligibility */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Is my item returnable?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-green-200 bg-green-50/50 rounded-xl p-6">
                            <h3 className="flex items-center gap-2 font-bold text-green-800 mb-4">
                                <CheckCircle2 className="w-5 h-5" />
                                Returnable Items
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></span>
                                    Standard components (Buttons, PCBs, Cables)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></span>
                                    Unopened and unused products
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></span>
                                    Items with manufacturing defects (within 7 days)
                                </li>
                            </ul>
                        </div>
                        <div className="border border-red-200 bg-red-50/50 rounded-xl p-6">
                            <h3 className="flex items-center gap-2 font-bold text-red-800 mb-4">
                                <XCircle className="w-5 h-5" />
                                Non-Returnable Items
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2"></span>
                                    Custom-ordered parts (Rails cut to size)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2"></span>
                                    Electronic items if seal is broken
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2"></span>
                                    Used or installed items
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <span className="inline-block bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-full text-sm">
                            Return Window: 7 Days from Delivery
                        </span>
                    </div>
                </section>

                {/* Section 2: Return Process */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <RefreshCw className="text-orange-600" />
                        Easy Return Process
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: FileText, title: "1. Raise Request", desc: "Go to 'My Orders' and select Return." },
                            { icon: CheckCircle2, title: "2. Approvals", desc: "Team verifies photos/reason (24hrs)." },
                            { icon: Truck, title: "3. Pickup", desc: "Courier partner collects item (48hrs)." },
                            { icon: Wallet, title: "4. Refund", desc: "Refund initiated after quality check." }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-4">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                    <step.icon size={24} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                                <p className="text-sm text-gray-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 3: Refund Timelines */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Timelines</h2>
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Payment Method</th>
                                    <th className="px-6 py-4">Refund Destination</th>
                                    <th className="px-6 py-4">Time to Reflect</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 font-medium">UPI / Credit Card / Netbanking</td>
                                    <td className="px-6 py-4">Source Account</td>
                                    <td className="px-6 py-4">5-7 Business Days</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Cash on Delivery (COD)</td>
                                    <td className="px-6 py-4">Bank Account (NEFT)</td>
                                    <td className="px-6 py-4">3-5 Business Days</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    )
}

