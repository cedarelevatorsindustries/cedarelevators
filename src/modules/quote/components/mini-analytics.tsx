"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react"

export const MiniAnalytics = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="px-4 pb-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-gray-500" />
                        <span className="font-bold text-gray-700">Business Analytics</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>

                {isOpen && (
                    <div className="p-4">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Products</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Hydraulic Pump</span>
                                        <span className="font-bold">12 units</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Control Panel</span>
                                        <span className="font-bold">8 units</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Conversion Rate</span>
                                    <span className="text-lg font-bold text-green-600">24.5%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

