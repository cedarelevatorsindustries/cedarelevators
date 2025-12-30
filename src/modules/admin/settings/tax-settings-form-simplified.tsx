"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getTaxSettings, updateTaxSettings } from "@/lib/services/settings"
import { TaxSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Save, LoaderCircle } from "lucide-react"

const GST_RATES = [0, 5, 12, 18, 28]

export function TaxSettingsFormSimplified() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<TaxSettings | null>(null)
  const [formData, setFormData] = useState({
    gst_enabled: true,
    default_gst_percentage: 18,
    use_cgst_sgst_igst: true,
    prices_include_tax: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await getTaxSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          gst_enabled: result.data.gst_enabled,
          default_gst_percentage: result.data.default_gst_percentage,
          use_cgst_sgst_igst: result.data.use_cgst_sgst_igst,
          prices_include_tax: result.data.prices_include_tax,
        })
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
      const result = await updateTaxSettings(settings.id, formData)
      if (result.success) {
        toast.success('Tax settings saved successfully')
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to save tax settings')
      }
    } catch (error) {
      console.error('Error updating tax settings:', error)
      toast.error('Failed to save tax settings')
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
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* GST Configuration */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          GST Configuration
        </h3>

        <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-gray-900">Enable GST</Label>
            <p className="text-sm text-gray-500 mt-1">Apply GST to all transactions</p>
          </div>
          <Switch
            checked={formData.gst_enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gst_enabled: checked }))}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Default GST Rate (%)</Label>
          <Select
            value={formData.default_gst_percentage.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, default_gst_percentage: parseFloat(value) }))}
          >
            <SelectTrigger className="max-w-sm h-12 text-base">
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
        </div>
      </div>

      {/* Tax Structure */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Tax Structure
        </h3>

        <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-gray-900">CGST / SGST Split</Label>
            <p className="text-sm text-gray-500 mt-1">Calculate intra-state (CGST+SGST) vs inter-state (IGST)</p>
          </div>
          <Switch
            checked={formData.use_cgst_sgst_igst}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_cgst_sgst_igst: checked }))}
          />
        </div>
      </div>

      {/* Pricing Mode */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Pricing Mode
        </h3>

        <RadioGroup
          value={formData.prices_include_tax ? "inclusive" : "exclusive"}
          onValueChange={(value) => setFormData(prev => ({ ...prev, prices_include_tax: value === "inclusive" }))}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4 py-4 px-5 bg-gray-50 rounded-xl">
            <RadioGroupItem value="exclusive" id="exclusive" className="h-5 w-5" />
            <Label htmlFor="exclusive" className="text-base font-medium text-gray-900 cursor-pointer">
              Prices exclusive of tax
            </Label>
          </div>
          <div className="flex items-center space-x-4 py-4 px-5 bg-gray-50 rounded-xl">
            <RadioGroupItem value="inclusive" id="inclusive" className="h-5 w-5" />
            <Label htmlFor="inclusive" className="text-base font-medium text-gray-900 cursor-pointer">
              Prices inclusive of tax
            </Label>
          </div>
        </RadioGroup>
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
  )
}
