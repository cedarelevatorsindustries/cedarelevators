'use client'

import Link from 'next/link'
import { Shield, ChevronRight } from 'lucide-react'

export default function SecurityLinkSection() {
    return (
        <section className="border-t pt-8">
            <Link href="/profile/security">
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Security Settings</h4>
                            <p className="text-sm text-gray-600">Manage your password and security preferences</p>
                        </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
            </Link>
        </section>
    )
}
