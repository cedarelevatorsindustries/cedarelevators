"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPaymentSettings, updatePaymentSettings } from "@/lib/services/settings"
import { PaymentSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, LoaderCircle, AlertTriangle } from "lucide-react"

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState({
    razorpay_enabled: false,
    bank_transfer_enabled: false,
  })

  // Payment Eligibility Rules
  const [eligibilityRules, setEligibilityRules] = useState({
    guest_payments_allowed: false,
    individual_payments_allowed: false,
    business_unverified_payments_allowed: false,
    business_verified_payments_allowed: true,
  })

  // Payment Method Visibility
  const [methodVisibility, setMethodVisibility] = useState({
    razorpay_verified_only: true,
    bank_transfer_unverified_allowed: true,
  })

  // Quote-Based Rules
  const [quoteRules, setQuoteRules] = useState({
    require_quote_approval: true,
    require_verified_for_quote_payment: true,
  })

  // Order Value Rules
  const [orderRules, setOrderRules] = useState({
    minimum_order_value: 0,
    block_above_enabled: false,
    block_above_value: 0,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await getPaymentSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setPaymentMethods({
          razorpay_enabled: result.data.razorpay_enabled,
          bank_transfer_enabled: result.data.bank_transfer_enabled,
        })
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
      toast.error('Failed to load payment settings')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSaveClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    setShowConfirmModal(false)
    if (!settings) {
      toast.error('Settings not loaded')
      return
    }

    setIsLoading(true)
    try {
      const result = await updatePaymentSettings(settings.id, {
        razorpay_enabled: paymentMethods.razorpay_enabled,
        bank_transfer_enabled: paymentMethods.bank_transfer_enabled,
        credit_terms_enabled: false,
      })
      if (result.success) {
        toast.success('Payment settings saved successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to save payment settings')
      }
    } catch (error) {
      console.error('Error updating payment settings:', error)
      toast.error('Failed to save payment settings')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-10">
        {/* 1. Payment Methods */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Payment Methods
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Razorpay</Label>
                <p className="text-sm text-gray-500 mt-1">Online payments (UPI, Cards, Netbanking)</p>
              </div>
              <Switch
                checked={paymentMethods.razorpay_enabled}
                onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, razorpay_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Bank Transfer</Label>
                <p className="text-sm text-gray-500 mt-1">Manual payment via bank details</p>
              </div>
              <Switch
                checked={paymentMethods.bank_transfer_enabled}
                onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, bank_transfer_enabled: checked }))}
              />
            </div>
          </div>
        </div>

        {/* 2. Payment Eligibility Rules */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Payment Eligibility
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Guest Users</Label>
                <p className="text-sm text-gray-500 mt-1">Allow payments (Recommended: OFF)</p>
              </div>
              <Switch
                checked={eligibilityRules.guest_payments_allowed}
                onCheckedChange={(checked) => setEligibilityRules(prev => ({ ...prev, guest_payments_allowed: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Individual Users</Label>
                <p className="text-sm text-gray-500 mt-1">Allow direct checkout (Recommended: OFF)</p>
              </div>
              <Switch
                checked={eligibilityRules.individual_payments_allowed}
                onCheckedChange={(checked) => setEligibilityRules(prev => ({ ...prev, individual_payments_allowed: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Business (Unverified)</Label>
                <p className="text-sm text-gray-500 mt-1">Allow payments (Recommended: OFF)</p>
              </div>
              <Switch
                checked={eligibilityRules.business_unverified_payments_allowed}
                onCheckedChange={(checked) => setEligibilityRules(prev => ({ ...prev, business_unverified_payments_allowed: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Business (Verified)</Label>
                <p className="text-sm text-gray-500 mt-1">Allow payments</p>
              </div>
              <Switch
                checked={eligibilityRules.business_verified_payments_allowed}
                onCheckedChange={(checked) => setEligibilityRules(prev => ({ ...prev, business_verified_payments_allowed: checked }))}
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Method Visibility */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Payment Method Visibility
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Razorpay - Verified Business Only</Label>
                <p className="text-sm text-gray-500 mt-1">Only show Razorpay to verified businesses</p>
              </div>
              <Switch
                checked={methodVisibility.razorpay_verified_only}
                onCheckedChange={(checked) => setMethodVisibility(prev => ({ ...prev, razorpay_verified_only: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Bank Transfer - Unverified Allowed</Label>
                <p className="text-sm text-gray-500 mt-1">Allow bank transfer for unverified businesses</p>
              </div>
              <Switch
                checked={methodVisibility.bank_transfer_unverified_allowed}
                onCheckedChange={(checked) => setMethodVisibility(prev => ({ ...prev, bank_transfer_unverified_allowed: checked }))}
              />
            </div>
          </div>
        </div>

        {/* 4. Quote-Based Payment Rules */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Quote-Based Payments
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Require Quote Approval</Label>
                <p className="text-sm text-gray-500 mt-1">Allow payment only after quote approval</p>
              </div>
              <Switch
                checked={quoteRules.require_quote_approval}
                onCheckedChange={(checked) => setQuoteRules(prev => ({ ...prev, require_quote_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Verified Business Required</Label>
                <p className="text-sm text-gray-500 mt-1">Require verified business to pay approved quotes</p>
              </div>
              <Switch
                checked={quoteRules.require_verified_for_quote_payment}
                onCheckedChange={(checked) => setQuoteRules(prev => ({ ...prev, require_verified_for_quote_payment: checked }))}
              />
            </div>
          </div>
        </div>

        {/* 5. Order Value Rules */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Order Value Rules
          </h3>

          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="text-base font-medium">Minimum Order Value (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={orderRules.minimum_order_value}
                onChange={(e) => setOrderRules(prev => ({ ...prev, minimum_order_value: parseFloat(e.target.value) || 0 }))}
                className="max-w-sm h-12 text-base"
              />
            </div>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-base font-medium text-gray-900">Block Orders Above</Label>
                <p className="text-sm text-gray-500 mt-1">Use for risk control (optional)</p>
              </div>
              <Switch
                checked={orderRules.block_above_enabled}
                onCheckedChange={(checked) => setOrderRules(prev => ({ ...prev, block_above_enabled: checked }))}
              />
            </div>

            {orderRules.block_above_enabled && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Maximum Order Value (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={orderRules.block_above_value}
                  onChange={(e) => setOrderRules(prev => ({ ...prev, block_above_value: parseFloat(e.target.value) || 0 }))}
                  className="max-w-sm h-12 text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-100">
          <Button
            onClick={handleSaveClick}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-6 text-base"
          >
            <Save className="mr-2 h-5 w-5" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Payment Settings Changes
            </DialogTitle>
            <DialogDescription className="text-base">
              These changes affect how customers can pay. Incorrect settings may block orders.
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 text-sm">
              {!paymentMethods.razorpay_enabled && !paymentMethods.bank_transfer_enabled
                ? "Warning: All payment methods are disabled. Customers will not be able to complete orders."
                : !paymentMethods.razorpay_enabled
                  ? "Disabling Razorpay will stop all online payments."
                  : "Review your changes carefully before saving."}
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

