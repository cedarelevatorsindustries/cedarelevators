"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, CheckCircle, Clock, XCircle, Upload, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { submitVerificationRequest } from "@/lib/actions/business-verification"
import type { Business } from "@/lib/services/auth-sync"

interface BusinessVerificationCardProps {
    business: Business
}

export function BusinessVerificationCard({ business }: BusinessVerificationCardProps) {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)

    const getStatusConfig = () => {
        switch (business.verification_status) {
            case 'verified':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600 bg-green-50 border-green-200',
                    label: 'Verified',
                    description: 'Your business is verified'
                }
            case 'pending':
                return {
                    icon: Clock,
                    color: 'text-orange-600 bg-orange-50 border-orange-200',
                    label: 'Pending Review',
                    description: 'Your verification request is under review'
                }
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-600 bg-red-50 border-red-200',
                    label: 'Rejected',
                    description: 'Your verification request was rejected'
                }
            default:
                return {
                    icon: Building2,
                    color: 'text-gray-600 bg-gray-50 border-gray-200',
                    label: 'Not Verified',
                    description: 'Apply for business verification'
                }
        }
    }

    const config = getStatusConfig()
    const StatusIcon = config.icon

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Business Verification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    <div className="flex-1">
                        <p className="font-semibold">{config.label}</p>
                        <p className="text-sm opacity-90">{config.description}</p>
                    </div>
                </div>

                {/* Verified State */}
                {business.verification_status === 'verified' && business.verified_at && (
                    <div className="text-sm text-gray-600">
                        <p>Verified on {new Date(business.verified_at).toLocaleDateString()}</p>
                    </div>
                )}

                {/* Pending State */}
                {business.verification_status === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Your verification request is being reviewed by our team. We'll notify you once it's processed.
                        </p>
                    </div>
                )}

                {/* Rejected State */}
                {business.verification_status === 'rejected' && (
                    <div className="space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                Your verification request was rejected. Please contact support or submit a new application.
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/profile/business/verification')}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Reapply for Verification
                        </Button>
                    </div>
                )}

                {/* Not Applied State */}
                {business.verification_status === 'unverified' && (
                    <div className="space-y-3">
                        {/* Benefits List */}
                        {!isExpanded && (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View benefits →
                            </button>
                        )}

                        {isExpanded && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <p className="text-sm font-semibold text-blue-900">Verification Benefits:</p>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>View product pricing and quote totals</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Convert approved quotes to orders</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Access to bulk pricing and credit terms</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Priority customer support</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        <Button
                            onClick={() => router.push('/profile/business/verification')}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Apply for Verification
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

