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
import { Save, LoaderCircle, Info } from "lucide-react"
import { useSettings } from "@/modules/admin/settings/settings-context"

const GST_RATES = [0, 5, 12, 18, 28]

export function TaxSettingsFormSimplified() {
  const { registerSaveHandler, unregisterSaveHandler } = useSettings()
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

  // Register save handler
  useEffect(() => {
    registerSaveHandler(async () => {
      await handleSubmit({ preventDefault: () => { } } as any)
    })
    return () => unregisterSaveHandler()
  }, [settings, formData])

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Pricing Mode - Step 1: Always Visible */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
          1. Pricing Mode
        </h3>

        <RadioGroup
          value={formData.prices_include_tax ? "inclusive" : "exclusive"}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            prices_include_tax: value === "inclusive",
            // Implicitly enable GST if switching modes, though backend likely handles this.
            // keeping current state or defaulting to true could be safe.
            gst_enabled: true
          }))}
          className="space-y-4"
        >
          <div className={`flex items-center space-x-4 py-4 px-5 rounded-xl transition-all ${formData.prices_include_tax
            ? 'bg-orange-50 border-orange-200 border'
            : 'bg-gray-50 border-transparent border hover:bg-gray-100'
            }`}>
            <RadioGroupItem value="inclusive" id="inclusive" className="h-5 w-5 text-orange-600 border-gray-400" />
            <div className="flex-1">
              <Label htmlFor="inclusive" className="text-lg font-semibold text-gray-900 cursor-pointer block">
                Prices inclusive of tax
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Prices displayed to customers already include GST. Tax is calculated backwards from the total.
              </p>
            </div>
          </div>

          <div className={`flex items-center space-x-4 py-4 px-5 rounded-xl transition-all ${!formData.prices_include_tax
            ? 'bg-orange-50 border-orange-200 border'
            : 'bg-gray-50 border-transparent border hover:bg-gray-100'
            }`}>
            <RadioGroupItem value="exclusive" id="exclusive" className="h-5 w-5 text-orange-600 border-gray-400" />
            <div className="flex-1">
              <Label htmlFor="exclusive" className="text-lg font-semibold text-gray-900 cursor-pointer block">
                Prices exclusive of tax
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Prices displayed are without tax. GST is added on top during checkout.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Step 2: Conditional Logic */}
      {formData.prices_include_tax ? (
        // Inclusive Mode UI
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Tax Included</h4>
            <p className="text-blue-700 mt-1">
              Prices already include applicable taxes. GST breakdown will be calculated automatically for invoices.
              No further configuration is required.
            </p>
          </div>
        </div>
      ) : (
        // Exclusive Mode UI
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* GST Rate */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              2. Global GST Rate
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Default GST Rate (%)</Label>
                <Select
                  value={formData.default_gst_percentage.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, default_gst_percentage: parseFloat(value) }))}
                >
                  <SelectTrigger className="max-w-sm h-12 text-base bg-white">
                    <SelectValue placeholder="Select GST rate" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {GST_RATES.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate}% GST
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This rate applies globally to all products unless specified otherwise.
                </p>
              </div>
            </div>
          </div>

          {/* Tax Structure / Split */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              3. GST Structure
            </h3>

            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <Label className="text-base font-medium text-gray-900">CGST / SGST Split</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically calculate intra-state (CGST+SGST) vs inter-state (IGST) split based on customer location.
                </p>
              </div>
              <Switch
                checked={formData.use_cgst_sgst_igst}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_cgst_sgst_igst: checked }))}
                className="data-[state=checked]:bg-orange-600"
              />
            </div>
          </div>
        </div>
      )}

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

