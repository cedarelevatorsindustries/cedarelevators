import { Metadata } from "next"
import { Package, Search, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
    title: "Track Your Order | Cedar Elevators",
    description: "Track your elevator components order with Cedar Elevators. Real-time updates on your shipment status.",
}

export default function TrackOrderPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                    <p className="text-gray-600">Enter your order number to track your shipment</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Track Order Form */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Search className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Enter Order Details</h2>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Order Number
                            </label>
                            <input
                                type="text"
                                id="orderNumber"
                                placeholder="e.g., ORD-000123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Track Order
                        </button>
                    </form>
                </div>

                {/* How to Track */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Track Your Order</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                                <p className="text-sm text-gray-600">
                                    Find your order number in the confirmation email sent after placing your order.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                                <p className="text-sm text-gray-600">
                                    Get live updates on your shipment location and estimated delivery time.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Delivery Timeline</h3>
                                <p className="text-sm text-gray-600">
                                    View estimated delivery date and track each stage of your shipment.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Search className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Order History</h3>
                                <p className="text-sm text-gray-600">
                                    Logged-in users can view all orders in their account dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">Need help with your order?</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        Contact Support →
                    </a>
                </div>
            </div>
        </div>
    )
}
