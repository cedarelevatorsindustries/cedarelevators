import { Metadata } from "next"
import { Shield, Award, Truck, Users, Clock, ThumbsUp } from "lucide-react"

export const metadata: Metadata = {
    title: "Why Choose Cedar Elevators | Premium Elevator Components",
    description: "Discover why Cedar Elevators is India's trusted B2B marketplace for premium elevator components. ISO certified quality, pan-India delivery, and expert support.",
}

export default function WhyChoosePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Cedar Elevators?</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        India's leading B2B marketplace for premium elevator components, trusted by professionals nationwide
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Key Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                            <Shield className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">ISO Certified Quality</h3>
                        <p className="text-gray-600">
                            All our products meet international quality standards with ISO certification,
                            ensuring reliability and safety for your elevator systems.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                            <Award className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">2-Year Warranty</h3>
                        <p className="text-gray-600">
                            Comprehensive 2-year warranty on all products, giving you peace of mind
                            and protection for your investment.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                            <Truck className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Pan-India Delivery</h3>
                        <p className="text-gray-600">
                            Fast and reliable delivery across India with real-time tracking,
                            ensuring your components reach you on time.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Support</h3>
                        <p className="text-gray-600">
                            Dedicated technical support team with deep industry knowledge,
                            ready to assist with product selection and technical queries.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                            <Clock className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Turnaround</h3>
                        <p className="text-gray-600">
                            Fast order processing and dispatch within 24-48 hours,
                            minimizing downtime for your projects.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                            <ThumbsUp className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted by Professionals</h3>
                        <p className="text-gray-600">
                            Serving contractors, installers, and maintenance professionals
                            across India with consistent quality and service.
                        </p>
                    </div>
                </div>

                {/* Our Commitment */}
                <div className="bg-white rounded-lg shadow-sm p-12 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Commitment to Excellence</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
                            <p className="text-gray-600 mb-4">
                                Every product in our catalog undergoes rigorous quality checks before dispatch.
                                We source only from certified manufacturers and maintain strict quality control standards.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">100% genuine products</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">Certified quality standards</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">Regular quality audits</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer-Centric Approach</h3>
                            <p className="text-gray-600 mb-4">
                                We understand the unique needs of B2B customers. Our platform is designed
                                to make procurement easy, efficient, and transparent.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">Bulk order discounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">Dedicated account managers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                                    <span className="text-gray-600">Flexible payment options</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                        <div className="text-gray-600 font-medium">Products</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
                        <div className="text-gray-600 font-medium">Happy Clients</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                        <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                        <div className="text-gray-600 font-medium">Support</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                        <div className="text-gray-600 font-medium">Satisfaction</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust Cedar Elevators for their elevator component needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/catalog"
                            className="inline-block bg-white text-blue-600 py-3 px-8 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Browse Products
                        </a>
                        <a
                            href="/contact"
                            className="inline-block bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

