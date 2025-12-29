"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsService } from "@/lib/services/settings"
import { TaxSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, Receipt, LoaderCircle, Info } from "lucide-react"

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

// Common GST rates
const GST_RATES = [0, 5, 12, 18, 28]

export function TaxSettingsFormSimplified() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<TaxSettings | null>(null)
  const [formData, setFormData] = useState({
    gst_enabled: true,
    default_gst_percentage: 18,
    prices_include_tax: false,
    use_cgst_sgst_igst: true,
    store_state: "Tamil Nadu",
    store_gstin: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await SettingsService.getTaxSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          gst_enabled: result.data.gst_enabled,
          default_gst_percentage: result.data.default_gst_percentage,
          prices_include_tax: result.data.prices_include_tax,
          use_cgst_sgst_igst: result.data.use_cgst_sgst_igst,
          store_state: result.data.store_state || "Tamil Nadu",
          store_gstin: result.data.store_gstin || "",
        })
      } else {
        toast.error(result.error || 'Failed to load tax settings')
      }
    } catch (error) {
      console.error('Error fetching tax settings:', error)
      toast.error('Failed to load tax settings')
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
      const result = await SettingsService.updateTaxSettings(settings.id, formData)
      if (result.success) {
        toast.success('Tax settings updated successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to update tax settings')
      }
    } catch (error) {
      console.error('Error updating tax settings:', error)
      toast.error('Failed to update tax settings')
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
            <strong>Cedar B2B Tax Model:</strong> Simplified GST-only configuration for Indian B2B elevator components platform. Multi-country tax logic has been removed.
          </AlertDescription>
        </Alert>

        {/* GST Configuration */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <Receipt className="h-5 w-5" />
              <span>GST Configuration</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Basic GST settings for Indian tax compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable GST */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Enable GST</Label>
                <p className="text-sm text-gray-600">
                  Apply GST to all transactions
                </p>
              </div>
              <Switch 
                checked={formData.gst_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gst_enabled: checked }))}
              />
            </div>

            {/* Default GST Percentage */}
            <div className="space-y-2">
              <Label htmlFor="gstRate">Default GST Rate (%)</Label>
              <Select
                value={formData.default_gst_percentage.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_gst_percentage: parseFloat(value) }))}
              >
                <SelectTrigger id="gstRate">
                  <SelectValue placeholder="Select GST rate" />
                </SelectTrigger>
                <SelectContent>
                  {GST_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate.toString()}>
                      {rate}% GST
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Standard GST rate applied to all products</p>
            </div>
          </CardContent>
        </Card>

        {/* Tax Calculation Rules */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Tax Calculation Rules</CardTitle>
            <CardDescription className="text-gray-600">
              Configure how taxes are calculated and displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prices Include Tax */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Prices Include Tax</Label>
                <p className="text-sm text-gray-600">
                  Product prices are tax-inclusive (vs tax-exclusive)
                </p>
              </div>
              <Switch 
                checked={formData.prices_include_tax}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, prices_include_tax: checked }))}
              />
            </div>

            {/* CGST/SGST/IGST Split */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">Use CGST/SGST/IGST Split</Label>
                <p className="text-sm text-gray-600">
                  Calculate intra-state (CGST+SGST) vs inter-state (IGST)
                </p>
              </div>
              <Switch 
                checked={formData.use_cgst_sgst_igst}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_cgst_sgst_igst: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Location (for GST calculation) */}
        <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Store Location</CardTitle>
            <CardDescription className="text-gray-600">
              Required for CGST/SGST/IGST calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {/* Store State */}
              <div className="space-y-2">
                <Label htmlFor="storeState">Store State</Label>
                <Select
                  value={formData.store_state}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, store_state: value }))}
                >
                  <SelectTrigger id="storeState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Your business location for tax calculation</p>
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN Number</Label>
                <Input
                  id="gstin"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.store_gstin}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_gstin: e.target.value.toUpperCase() }))}
                  maxLength={15}
                />
                <p className="text-xs text-gray-500">15-character GST identification number</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Tax Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
