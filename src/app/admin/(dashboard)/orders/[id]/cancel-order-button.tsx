"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { XCircle } from "lucide-react"
import { cancelOrder } from "@/lib/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CancelOrderButtonProps {
    orderId: string
    orderStatus: string
}

export function CancelOrderButton({ orderId, orderStatus }: CancelOrderButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Don't show cancel button for already cancelled or delivered orders
    if (orderStatus === 'cancelled' || orderStatus === 'delivered') {
        return null
    }

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await cancelOrder(orderId, cancelReason)
            if (result.success) {
                toast.success('Order cancelled successfully. Customer has been notified via email.')
                setOpen(false)
                setCancelReason('')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to cancel order')
            }
        } catch (error) {
            console.error('Cancel order error:', error)
            toast.error('Failed to cancel order')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                onClick={() => setOpen(true)}
            >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            This will cancel the order and restore inventory. The customer will be notified via email. Please provide a reason for cancellation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cancelReason">Cancellation Reason *</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="e.g., Customer requested cancellation, Out of stock, Payment failed"
                                rows={4}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Keep Order
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
