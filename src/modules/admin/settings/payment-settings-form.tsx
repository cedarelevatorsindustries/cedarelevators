"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsService } from "@/lib/services/settings"
import { PaymentSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, CreditCard, Banknote, Building2, LoaderCircle, Info } from "lucide-react"

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [formData, setFormData] = useState({
    razorpay_enabled: false,
    bank_transfer_enabled: false,
    credit_terms_enabled: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await SettingsService.getPaymentSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          razorpay_enabled: result.data.razorpay_enabled,
          bank_transfer_enabled: result.data.bank_transfer_enabled,
          credit_terms_enabled: result.data.credit_terms_enabled,
        })
      } else {
        toast.error(result.error || 'Failed to load payment settings')
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
      toast.error('Failed to load payment settings')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) {
      toast.error('Settings not loaded')
      return
    }

    setIsLoading(true)
    try {
      const result = await SettingsService.updatePaymentSettings(settings.id, formData)
      if (result.success) {
        toast.success('Payment settings updated successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating payment settings:', error)
      toast.error('Failed to update payment settings')
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
    <div className="w-full max-w-full overflow-x-hidden">
      <form onSubmit={handleSubmit} className="space-y-8 w-full">
        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Configuration Note:</strong> Razorpay API keys must be set in environment variables (.env file). This page only controls which payment methods are enabled.
          </AlertDescription>
        </Alert>

        {/* Razorpay Integration */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <CreditCard className="h-5 w-5" />
              <span>Razorpay Integration</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enable or disable online payments via Razorpay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Enable Razorpay</Label>
                <p className="text-sm text-gray-600">
                  Accept online payments including UPI, Cards, Net Banking
                </p>
              </div>
              <Switch 
                checked={formData.razorpay_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, razorpay_enabled: checked }))}
              />
            </div>

            {formData.razorpay_enabled && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Required Environment Variables:</strong>
                  <br />
                  • <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code>
                  <br />
                  • <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">RAZORPAY_KEY_SECRET</code>
                  <br />
                  <span className="text-xs text-amber-700 mt-1 block">
                    These must be configured in your .env file before enabling Razorpay.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Transfer */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <Building2 className="h-5 w-5" />
              <span>Bank Transfer</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Allow direct bank transfers for B2B customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Enable Bank Transfer</Label>
                <p className="text-sm text-gray-600">
                  Customers can pay via direct bank transfer
                </p>
              </div>
              <Switch 
                checked={formData.bank_transfer_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bank_transfer_enabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Credit Terms */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <Banknote className="h-5 w-5" />
              <span>Credit Terms</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Allow verified business customers to buy on credit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Enable Credit Terms</Label>
                <p className="text-sm text-gray-600">
                  Verified business accounts can purchase on credit (NET 30/60)
                </p>
              </div>
              <Switch 
                checked={formData.credit_terms_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, credit_terms_enabled: checked }))}
              />
            </div>

            {formData.credit_terms_enabled && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Credit terms are only available to <strong>Verified Business</strong> accounts. Credit limits and payment terms must be configured manually per customer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
