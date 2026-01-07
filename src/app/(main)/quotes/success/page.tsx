import Link from 'next/link';
import { CheckCircle, Mail, ArrowRight, Home } from 'lucide-react';

export default function QuoteSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Quote Request Submitted!
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Thank you for your quote request. Our team will review your
                    requirements and get back to you within 24-48 hours with a
                    detailed quotation.
                </p>

                {/* Email Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Check your email</p>
                        <p className="text-sm text-blue-700 mt-1">
                            We&apos;ll send a confirmation and follow-up emails to the address you provided.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Create Account CTA */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">
                        Want to track your quotes and get faster responses?
                    </p>
                    <Link
                        href="/sign-up"
                        className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
                    >
                        Create a free account →
                    </Link>
                </div>
            </div>
        </div>
    );
}
