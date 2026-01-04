import { Metadata } from "next"
import { Truck, MapPin, Clock, CalendarCheck, Info } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
    title: "Shipping Information | Cedar Elevators",
    description: "Learn about our shipping policies, delivery times, and order processing.",
}

export default function ShippingPage() {
    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        Shipping Information
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Fast, reliable delivery across India. We ensure your elevator components arrive safely and on time.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl mt-12 space-y-16">
                {/* Section 1: Delivery Overview */}
                <section>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="text-orange-600" />
                                Delivery Overview
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                                    <Truck className="text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Pan-India Delivery</h3>
                                        <p className="text-sm text-gray-600">We ship to over 19,000 pincodes across India via trusted partners like Delhivery, BlueDart, and Spoton.</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg flex gap-3">
                                    <Clock className="text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Estimated Times</h3>
                                        <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                                            <li>Metro Cities: 3-5 Business Days</li>
                                            <li>Rest of India: 5-8 Business Days</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Placeholder for map/image */}
                        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center border border-gray-200">
                            <span className="text-gray-400 font-medium">India Delivery Map Visualization</span>
                        </div>
                    </div>
                </section>

                {/* Section 2: Shipping Charges */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Charges</h2>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                            <div className="p-6 text-center">
                                <div className="text-4xl font-bold text-gray-900 mb-2">Free</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Standard Shipping</div>
                                <p className="text-sm text-gray-600 mt-2">On orders above ₹5,000</p>
                            </div>
                            <div className="p-6 text-center">
                                <div className="text-4xl font-bold text-gray-900 mb-2">₹199</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Flat Rate</div>
                                <p className="text-sm text-gray-600 mt-2">On orders below ₹5,000</p>
                            </div>
                            <div className="p-6 text-center">
                                <div className="text-orange-600 font-bold mb-2">Custom Quote</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Heavy/Bulky Items</div>
                                <p className="text-sm text-gray-600 mt-2">Calculated at checkout for motors & rails</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Order Processing */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <CalendarCheck className="text-orange-600" />
                        Order Processing Timeline
                    </h2>
                    <div className="relative border-l-2 border-gray-200 ml-4 space-y-12">
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100"></div>
                            <h3 className="font-semibold text-gray-900 text-lg">Order Placed</h3>
                            <p className="text-gray-600">You receive an instant confirmation email/SMS.</p>
                        </div>
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-white ring-2 ring-orange-100"></div>
                            <h3 className="font-semibold text-gray-900 text-lg">Dispatch (24-48 Hours)</h3>
                            <p className="text-gray-600">Quality check, packaging, and handover to courier partner.</p>
                        </div>
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100"></div>
                            <h3 className="font-semibold text-gray-900 text-lg">Out for Delivery</h3>
                            <p className="text-gray-600">You get a tracking link to monitor your shipment real-time.</p>
                        </div>
                    </div>
                </section>

                {/* Section 4: FAQs */}
                <section className="bg-gray-50 rounded-xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Info className="text-gray-500" />
                        Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Can I change my address after placing an order?</AccordionTrigger>
                            <AccordionContent>
                                Addresses can only be changed if the order hasn't been processed yet (usually within 12 hours). Please contact support immediately.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What if my delivery is delayed?</AccordionTrigger>
                            <AccordionContent>
                                Delays can happen due to transit issues or weather. You can track your order status in the 'My Orders' section. If it's delayed beyond 48 hours of estimate, contact us.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Do you deliver to construction sites?</AccordionTrigger>
                            <AccordionContent>
                                Yes, provided there is a reachable road for the delivery truck and someone available to receive the package.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </div>
        </div>
    )
}

