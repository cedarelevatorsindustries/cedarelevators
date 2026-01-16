"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getShippingSettings, updateShippingSettings } from "@/lib/services/settings"
import { ShippingSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, LoaderCircle, Info } from "lucide-react"
import { PickupLocationsManager } from "./pickup-locations-manager"

export function ShippingSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<ShippingSettings | null>(null)
  const [formData, setFormData] = useState({
    free_shipping_enabled: false,
    free_shipping_threshold: 50000,
    delivery_sla_text: "Delivered within 5–7 working days",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await getShippingSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          free_shipping_enabled: result.data.free_shipping_enabled,
          free_shipping_threshold: result.data.free_shipping_threshold,
          delivery_sla_text: result.data.delivery_sla_text || "Delivered within 5–7 working days",
        })
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
      const result = await updateShippingSettings(settings.id, {
        free_shipping_enabled: formData.free_shipping_enabled,
        free_shipping_threshold: formData.free_shipping_threshold,
        delivery_sla_text: formData.delivery_sla_text,
      })
      if (result.success) {
        toast.success('Shipping settings saved successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to save shipping settings')
      }
    } catch (error) {
      console.error('Error updating shipping settings:', error)
      toast.error('Failed to save shipping settings')
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
    <div className="space-y-10">
      {/* Shipping Settings Form - Part 1 */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Shipping Information */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Shipping Configuration
          </h3>

          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Pay on Delivery Model</p>
              <p className="text-sm text-blue-700 mt-1">
                Customers pay shipping charges on delivery. Enable free shipping below to waive charges for orders above a minimum value.
              </p>
            </div>
          </div>
        </div>

        {/* Free Shipping */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Free Shipping
          </h3>

          <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
            <div>
              <Label className="text-base font-medium text-gray-900">Enable Free Shipping</Label>
              <p className="text-sm text-gray-500 mt-1">Offer free shipping above a minimum order value</p>
            </div>
            <Switch
              checked={formData.free_shipping_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, free_shipping_enabled: checked }))}
            />
          </div>

          {formData.free_shipping_enabled && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Free above (₹)</Label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
                className="max-w-sm h-12 text-base"
              />
            </div>
          )}
        </div>
      </form>

      {/* In-Store Pickup Locations - Separate section between Free Shipping and Delivery */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          In-Store Pickup Locations
        </h3>
        <PickupLocationsManager />
      </div>

      {/* Shipping Settings Form - Part 2 */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Delivery Information */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Delivery Information
          </h3>

          <div className="space-y-3">
            <Label className="text-base font-medium">Delivery note shown to customers</Label>
            <Textarea
              placeholder="Delivered within 5–7 working days"
              value={formData.delivery_sla_text}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_sla_text: e.target.value }))}
              rows={3}
              className="text-base"
            />
            <p className="text-sm text-gray-500">This text is shown at checkout</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-6 text-base"
          >
            <Save className="mr-2 h-5 w-5" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
