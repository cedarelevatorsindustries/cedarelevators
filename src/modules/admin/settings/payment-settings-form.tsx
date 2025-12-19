"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SettingsService } from "@/lib/services/settings"
import { PaymentSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, CreditCard, Banknote, Loader2 } from "lucide-react"

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [formData, setFormData] = useState({
    razorpay_enabled: false,
    razorpay_key_id: "",
    razorpay_key_secret: "",
    razorpay_test_mode: true,
    cod_enabled: false,
    cod_max_amount: 0,
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
          razorpay_key_id: result.data.razorpay_key_id || "",
          razorpay_key_secret: result.data.razorpay_key_secret || "",
          razorpay_test_mode: result.data.razorpay_test_mode,
          cod_enabled: result.data.cod_enabled,
          cod_max_amount: result.data.cod_max_amount || 0,
        })
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
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-red-950/20 border-red-100/50 dark:border-red-900/20 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5" />
            <span>Razorpay Integration</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enable or disable online payments via Razorpay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">Enable Razorpay</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accept online payments including UPI, Cards, Net Banking
              </p>
            </div>
            <Switch 
              checked={formData.razorpay_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, razorpay_enabled: checked }))}
            />
          </div>

          {formData.razorpay_enabled && (
            <div className="space-y-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
              <div className="space-y-2">
                <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                <Input
                  id="razorpayKeyId"
                  type="text"
                  placeholder="rzp_live_xxxxxxxxxxxxx"
                  value={formData.razorpay_key_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                <Input
                  id="razorpayKeySecret"
                  type="password"
                  placeholder="Enter secret key"
                  value={formData.razorpay_key_secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.razorpay_test_mode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, razorpay_test_mode: checked }))}
                />
                <Label>Test Mode</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-red-950/20 border-red-100/50 dark:border-red-900/20 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
            <Banknote className="h-5 w-5" />
            <span>Cash on Delivery (COD)</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enable or disable cash on delivery payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">Enable COD</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow customers to pay when they receive their order
              </p>
            </div>
            <Switch 
              checked={formData.cod_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cod_enabled: checked }))}
            />
          </div>

          {formData.cod_enabled && (
            <div className="space-y-2 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
              <Label htmlFor="codMaxAmount">Maximum COD Amount (₹)</Label>
              <Input
                id="codMaxAmount"
                type="number"
                placeholder="0"
                value={formData.cod_max_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, cod_max_amount: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 for no limit
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      </form>
    </div>
  )
}
