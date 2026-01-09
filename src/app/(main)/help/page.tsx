import { Metadata } from 'next'
import Link from 'next/link'
import {
    CircleHelp,
    MessageCircle,
    Phone,
    Mail,
    FileText,
    Package,
    CreditCard,
    Truck,
    Shield
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Help Center | Cedar Elevators',
    description: 'Get help and support for your Cedar Elevators account',
}

const helpCategories = [
    {
        title: 'Getting Started',
        icon: CircleHelp,
        articles: [
            { title: 'How to create an account', href: '#' },
            { title: 'Setting up your business profile', href: '#' },
            { title: 'Navigating the catalog', href: '#' },
        ]
    },
    {
        title: 'Orders & Quotes',
        icon: Package,
        articles: [
            { title: 'How to request a quote', href: '/quotes/new' },
            { title: 'Tracking your order', href: '/track' },
            { title: 'Order history and invoices', href: '/profile/orders' },
        ]
    },
    {
        title: 'Payments',
        icon: CreditCard,
        articles: [
            { title: 'Payment methods accepted', href: '#' },
            { title: 'Understanding invoices', href: '#' },
            { title: 'Payment terms for businesses', href: '#' },
        ]
    },
    {
        title: 'Shipping & Delivery',
        icon: Truck,
        articles: [
            { title: 'Shipping policy', href: '/shipping' },
            { title: 'Delivery timelines', href: '#' },
            { title: 'Installation services', href: '#' },
        ]
    },
    {
        title: 'Account & Security',
        icon: Shield,
        articles: [
            { title: 'Managing your account', href: '/profile' },
            { title: 'Security settings', href: '/profile/security' },
            { title: 'Business verification', href: '/profile/approvals' },
        ]
    },
]

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                    <p className="text-lg text-gray-600">
                        Find answers to common questions and get support
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <CircleHelp className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Help Categories */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {helpCategories.map((category) => {
                        const Icon = category.icon
                        return (
                            <div key={category.title} className="bg-white rounded-lg border p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
                                </div>
                                <ul className="space-y-2">
                                    {category.articles.map((article) => (
                                        <li key={article.title}>
                                            <Link
                                                href={article.href}
                                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {article.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Contact Support */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg border p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Still need help?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/contact"
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Contact Support</h3>
                                <p className="text-sm text-gray-600">Get in touch with our team</p>
                            </div>
                        </Link>

                        <a
                            href="tel:+911234567890"
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Call Us</h3>
                                <p className="text-sm text-gray-600">+91 123 456 7890</p>
                            </div>
                        </a>

                        <a
                            href="mailto:support@cedarelevators.com"
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Mail className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Email Us</h3>
                                <p className="text-sm text-gray-600">support@cedarelevators.com</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
