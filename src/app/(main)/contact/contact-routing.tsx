"use client"

import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Mail, Phone } from "lucide-react"

type Department = 'order' | 'technical' | 'bulk' | 'installation'

const DEPARTMENTS = {
    order: {
        label: "Order Support",
        email: "orders@cedarelevator.com",
        desc: "For status, cancellations, or tracking."
    },
    technical: {
        label: "Technical Support",
        email: "tech@cedarelevator.com",
        desc: "For compatibility specs and troubleshooting."
    },
    bulk: {
        label: "Bulk / B2B Inquiry",
        email: "sales@cedarelevator.com",
        desc: "For volume pricing and quotes."
    },
    installation: {
        label: "Installation Support",
        email: "service@cedarelevator.com",
        desc: "For scheduling and site visits."
    }
}

export function ContactRouting() {
    const [dept, setDept] = useState<Department | ''>('')

    const selected = dept ? DEPARTMENTS[dept] : null

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect with the right team</h3>
            <div className="space-y-4">
                <Select onValueChange={(val) => setDept(val as Department)}>
                    <SelectTrigger className="w-full bg-white h-12">
                        <SelectValue placeholder="What do you need help with?" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="bulk">Bulk / B2B Inquiry</SelectItem>
                        <SelectItem value="installation">Installation Support</SelectItem>
                    </SelectContent>
                </Select>

                {selected && (
                    <div className="bg-white p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-sm text-gray-600 mb-3">{selected.desc}</p>
                        <div className="flex flex-col gap-2">
                            <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-blue-600 font-medium hover:underline">
                                <Mail size={16} />
                                {selected.email}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

