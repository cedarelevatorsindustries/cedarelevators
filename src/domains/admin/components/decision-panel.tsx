'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, CheckCircle, XCircle, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DecisionPanelProps {
    canEditPricing: boolean
    isUnverifiedBusiness: boolean
    hasUnsavedChanges: boolean
    isSaving: boolean
    adminResponseMessage: string
    adminInternalNotes: string
    onResponseMessageChange: (value: string) => void
    onInternalNotesChange: (value: string) => void
    onApprove: () => void
    onReject: () => void
}

export function DecisionPanel({
    canEditPricing,
    isUnverifiedBusiness,
    hasUnsavedChanges,
    isSaving,
    adminResponseMessage,
    adminInternalNotes,
    onResponseMessageChange,
    onInternalNotesChange,
    onApprove,
    onReject
}: DecisionPanelProps) {
    if (!canEditPricing) return null

    return (
        <Card className="border-orange-300 bg-orange-50/30 shadow-sm">
            <CardHeader className="border-b border-orange-200 bg-orange-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-orange-600" />
                    Decision Panel
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase text-xs">
                        Response Message (Customer Visible)
                    </label>
                    <textarea
                        value={adminResponseMessage}
                        onChange={(e) => onResponseMessageChange(e.target.value)}
                        placeholder="Write a message to the business owner..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase text-xs">
                        Internal Notes (Admin Only)
                    </label>
                    <textarea
                        value={adminInternalNotes}
                        onChange={(e) => onInternalNotesChange(e.target.value)}
                        placeholder="Documentation for auditing purposes..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm bg-gray-50"
                    />
                </div>

                {/* Conditional messaging based on user type */}
                {isUnverifiedBusiness && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FileWarning className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900 text-sm mb-1">Verified Business Rule:</p>
                                <p className="text-sm text-amber-800">Cannot convert immediately after approval. Require business verification to place order.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approve/Reject Buttons */}
                <div className="space-y-3 pt-5 border-t border-orange-200">
                    <Button
                        onClick={onApprove}
                        disabled={isSaving || hasUnsavedChanges}
                        className="w-full bg-[#FF6B35] hover:bg-[#FF5722] text-white font-semibold py-6 text-base"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Quote
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="outline"
                        disabled={isSaving}
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 font-semibold py-6 text-base"
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject Quote
                    </Button>
                    {hasUnsavedChanges && (
                        <p className="text-xs text-orange-600 text-center">
                            Please save pricing changes before approving
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
