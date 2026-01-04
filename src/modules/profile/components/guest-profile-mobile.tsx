'use client'

import Link from 'next/link'
import { Package, FileText, CircleHelp, Headset, ChevronRight, User, Download, Shield, Truck, RotateCcw, Phone, MessageCircle } from 'lucide-react'

export default function GuestProfileMobile() {
    return (
        <div className="flex flex-col min-h-screen bg-white pb-20 relative z-0">
            {/* Header section with Guest Icon */}
            <div className="bg-white p-6 flex flex-col items-center justify-center">
                <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-gray-500" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Guest User</h2>
                <p className="text-gray-500 text-center text-sm px-8 mb-6 leading-relaxed">
                    Log in or create an account to manage your orders.
                </p>

                <div className="w-full space-y-3 px-2">
                    <Link
                        href="/sign-in"
                        className="w-full flex items-center justify-center bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold h-12 rounded-lg uppercase tracking-wide transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/sign-up"
                        className="w-full flex items-center justify-center border border-[#FF4500] text-[#FF4500] bg-white hover:bg-orange-50 font-bold h-12 rounded-lg uppercase tracking-wide transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Track Order */}
            <div className="mt-2 text-left w-full">
                <div className="flex flex-col">
                    <MenuItem icon={Package} label="Track Order" href="/track-order" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Resources & Downloads */}
            <div className="mt-2 text-left w-full">
                <div className="flex flex-col">
                    <MenuItem icon={Download} label="Resources & Downloads" href="/resources" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Help & Support */}
            <div className="mt-2 text-left w-full">
                <div className="px-6 py-4">
                    <h3 className="font-bold text-gray-900 text-lg">Help & Support</h3>
                </div>
                <div className="flex flex-col">
                    <MenuItem icon={CircleHelp} label="Help Center & FAQ" href="/help" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Contact Sales Team */}
            <div className="mt-2 text-left w-full">
                <div className="px-6 py-4">
                    <h3 className="font-bold text-gray-900 text-lg">Contact Sales Team</h3>
                </div>
                <div className="flex flex-col">
                    <MenuItem icon={Phone} label="Call Sales" href="tel:+911234567890" bgColor="bg-gray-100" iconColor="text-gray-600" />
                    <MenuItem icon={MessageCircle} label="WhatsApp Sales" href="https://wa.me/911234567890" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Warranty Information */}
            <div className="mt-2 text-left w-full">
                <div className="flex flex-col">
                    <MenuItem icon={Shield} label="Warranty Information" href="/warranty" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="mt-2 text-left w-full">
                <div className="flex flex-col">
                    <MenuItem icon={Truck} label="Shipping & Delivery" href="/shipping" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* Return & Refund Policy */}
            <div className="mt-2 text-left w-full">
                <div className="flex flex-col">
                    <MenuItem icon={RotateCcw} label="Return & Refund Policy" href="/returns" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

            {/* All Policies */}
            <div className="mt-2 text-left w-full">
                <div className="px-6 py-4">
                    <h3 className="font-bold text-gray-900 text-lg">All Policies</h3>
                </div>
                <div className="flex flex-col">
                    <MenuItem icon={FileText} label="Privacy Policy" href="/privacy" bgColor="bg-gray-100" iconColor="text-gray-600" />
                    <MenuItem icon={FileText} label="Terms of Service" href="/terms" bgColor="bg-gray-100" iconColor="text-gray-600" />
                    <MenuItem icon={FileText} label="Payment Terms" href="/payment-terms" bgColor="bg-gray-100" iconColor="text-gray-600" />
                </div>
            </div>

        </div>
    )
}

function MenuItem({ icon: Icon, label, href, bgColor, iconColor }: any) {
    return (
        <Link href={href} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 ${bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className="text-gray-900 font-medium text-[15px]">{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" strokeWidth={2} />
        </Link>
    )
}

