"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { SettingsService } from "@/lib/services/settings"
import { ShippingSettings, ShippingZone } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, LoaderCircle, Truck } from "lucide-react"

export function ShippingSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<ShippingSettings | null>(null)
  const [formData, setFormData] = useState({
    free_shipping_enabled: false,
    free_shipping_threshold: 2000,
    flat_rate_enabled: true,
    delivery_sla_text: "7-10 business days",
    shipping_zones: [] as ShippingZone[],
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await SettingsService.getShippingSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          free_shipping_enabled: result.data.free_shipping_enabled,
          free_shipping_threshold: result.data.free_shipping_threshold,
          flat_rate_enabled: result.data.flat_rate_enabled,
          delivery_sla_text: result.data.delivery_sla_text || "7-10 business days",
          shipping_zones: result.data.shipping_zones || [],
        })
      } else {
        toast.error(result.error || 'Failed to load shipping settings')
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error)
      toast.error('Failed to load shipping settings')
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
      const result = await SettingsService.updateShippingSettings(settings.id, formData)
      if (result.success) {
        toast.success('Shipping settings updated successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to update shipping settings')
      }
    } catch (error) {
      console.error('Error updating shipping settings:', error)
      toast.error('Failed to update shipping settings')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleZone = (index: number) => {
    const newZones = [...formData.shipping_zones]
    newZones[index].enabled = !newZones[index].enabled
    setFormData(prev => ({ ...prev, shipping_zones: newZones }))
  }

  const updateZoneRate = (index: number, newRate: number) => {
    const newZones = [...formData.shipping_zones]
    newZones[index].rate = newRate
    setFormData(prev => ({ ...prev, shipping_zones: newZones }))
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
      <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <Truck className="h-5 w-5" />
            <span>Shipping Rates</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure shipping rates based on zones and item count (India only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.shipping_zones.map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={zone.enabled}
                    onCheckedChange={() => toggleZone(index)}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {zone.zone}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                        {zone.condition}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Shipping rate for {zone.zone.toLowerCase()} with {zone.condition.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{zone.rate}</div>
                    <div className="text-sm text-gray-500">per order</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Free Shipping</CardTitle>
          <CardDescription className="text-gray-600">
            Configure free shipping thresholds (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-gray-900">Enable Free Shipping</Label>
              <p className="text-sm text-gray-600">
                Offer free shipping above a minimum order value
              </p>
            </div>
            <Switch 
              checked={formData.free_shipping_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, free_shipping_enabled: checked }))}
            />
          </div>
          
          {formData.free_shipping_enabled && (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 w-full">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="freeShippingThreshold">Minimum Order Value (₹)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="2000"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="freeShippingZones">Applicable Zones</Label>
                <Input
                  id="freeShippingZones"
                  value="All zones"
                  disabled
                  className="bg-gray-50 w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Delivery SLA</CardTitle>
          <CardDescription className="text-gray-600">
            Estimated delivery timeframe displayed to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliverySla">Delivery Time</Label>
            <Input
              id="deliverySla"
              placeholder="e.g., 7-10 business days"
              value={formData.delivery_sla_text}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_sla_text: e.target.value }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500">This text is shown at checkout</p>
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
