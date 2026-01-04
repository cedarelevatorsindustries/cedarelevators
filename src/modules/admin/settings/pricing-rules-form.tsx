"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  getPricingSettings, 
  updatePricingSettings, 
  initializePricingSettings,
  PricingSettings 
} from "@/lib/services/pricing-settings"
import { toast } from "sonner"
import { Save, DollarSign, LoaderCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PricingRulesForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<PricingSettings | null>(null)
  const [formData, setFormData] = useState({
    guest_price_visible: false,
    individual_price_visible: false,
    business_unverified_price_visible: true,
    business_verified_price_visible: true,
    business_verified_can_buy: true,
    bulk_pricing_enabled: true,
    minimum_order_quantity: 1,
    discount_cap_percentage: 15.0,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      let result = await getPricingSettings()
      
      // If no settings exist, initialize them
      if (!result.success || !result.data) {
        result = await initializePricingSettings()
      }

      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          guest_price_visible: result.data.guest_price_visible,
          individual_price_visible: result.data.individual_price_visible,
          business_unverified_price_visible: result.data.business_unverified_price_visible,
          business_verified_price_visible: result.data.business_verified_price_visible,
          business_verified_can_buy: result.data.business_verified_can_buy,
          bulk_pricing_enabled: result.data.bulk_pricing_enabled,
          minimum_order_quantity: result.data.minimum_order_quantity,
          discount_cap_percentage: result.data.discount_cap_percentage,
        })
      }
    } catch (error) {
      console.error('Error fetching pricing settings:', error)
      toast.error('Failed to load pricing settings')
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
      const result = await updatePricingSettings(settings.id, formData)
      if (result.success) {
        toast.success('Pricing rules updated successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to update pricing rules')
      }
    } catch (error) {
      console.error('Error updating pricing settings:', error)
      toast.error('Failed to update pricing rules')
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
            <strong>Cedar B2B Pricing Model:</strong> Control how pricing behaves globally for different user types. These settings affect the entire platform.
          </AlertDescription>
        </Alert>

        {/* Price Visibility Rules */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <DollarSign className="h-5 w-5" />
              <span>Price Visibility Rules</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Control which user types can see product prices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guest */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Guest Users</Label>
                <p className="text-sm text-gray-600">
                  Show prices to non-logged-in users
                </p>
              </div>
              <Switch 
                checked={formData.guest_price_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, guest_price_visible: checked }))}
              />
            </div>

            {/* Individual */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Individual Users</Label>
                <p className="text-sm text-gray-600">
                  Show prices to logged-in individual accounts
                </p>
              </div>
              <Switch 
                checked={formData.individual_price_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, individual_price_visible: checked }))}
              />
            </div>

            {/* Business Unverified */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Business (Unverified)</Label>
                <p className="text-sm text-gray-600">
                  Show prices to unverified business accounts
                </p>
              </div>
              <Switch 
                checked={formData.business_unverified_price_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, business_unverified_price_visible: checked }))}
              />
            </div>

            {/* Business Verified */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Business (Verified)</Label>
                <p className="text-sm text-gray-600">
                  Show prices to verified business accounts
                </p>
              </div>
              <Switch 
                checked={formData.business_verified_price_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, business_verified_price_visible: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase Rules */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Purchase Rules</CardTitle>
            <CardDescription className="text-gray-600">
              Control who can complete checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Verified Business Checkout</Label>
                <p className="text-sm text-gray-600">
                  Allow verified business accounts to complete purchases
                </p>
              </div>
              <Switch 
                checked={formData.business_verified_can_buy}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, business_verified_can_buy: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bulk Pricing & Limits */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Bulk Pricing & Limits</CardTitle>
            <CardDescription className="text-gray-600">
              Configure bulk pricing and order limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Enable Bulk Pricing</Label>
                <p className="text-sm text-gray-600">
                  Allow volume-based discounts for large orders
                </p>
              </div>
              <Switch 
                checked={formData.bulk_pricing_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bulk_pricing_enabled: checked }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                <Input
                  id="moq"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minimum_order_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_quantity: parseInt(e.target.value) || 1 }))}
                />
                <p className="text-xs text-gray-500">Global default for all products</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountCap">Discount Cap (%)</Label>
                <Input
                  id="discountCap"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="15.0"
                  value={formData.discount_cap_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_cap_percentage: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-xs text-gray-500">Maximum discount admins can apply</p>
              </div>
            </div>
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

