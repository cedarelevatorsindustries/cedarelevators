"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getStoreSettings, updateStoreSettings } from "@/lib/services/settings"
import { StoreSettings } from "@/lib/types/settings"
import { toast } from "sonner"
import { Upload, Save, LoaderCircle } from "lucide-react"

export function GeneralSettingsForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [settings, setSettings] = useState<StoreSettings | null>(null)
    const [formData, setFormData] = useState({
        store_name: "",
        support_email: "",
        support_phone: "",
        invoice_prefix: "CEI",
        currency: "INR",
        timezone: "Asia/Kolkata",
        about_cedar: "",
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setIsFetching(true)
        try {
            const result = await getStoreSettings()
            if (result.success && result.data) {
                setSettings(result.data)
                setFormData({
                    store_name: result.data.store_name || "",
                    support_email: result.data.support_email || "",
                    support_phone: result.data.support_phone || "",
                    invoice_prefix: result.data.invoice_prefix || "CEI",
                    currency: result.data.currency || "INR",
                    timezone: result.data.timezone || "Asia/Kolkata",
                    about_cedar: result.data.about_cedar || "",
                })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Failed to load settings')
        } finally {
            setIsFetching(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) {
            toast.error('Settings not loaded')
            return
        }

        setIsLoading(true)
        try {
            const result = await updateStoreSettings(settings.id, formData)
            if (result.success) {
                toast.success('Settings saved successfully')
                fetchSettings()
            } else {
                toast.error(result.error || 'Failed to save settings')
            }
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error('Failed to save settings')
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
            {/* Store Information */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Store Information
                </h3>

                <div className="space-y-5">
                    <div className="space-y-3">
                        <Label htmlFor="storeName" className="text-base font-medium">Store Name</Label>
                        <Input
                            id="storeName"
                            placeholder="Cedar Elevator Industries"
                            value={formData.store_name}
                            onChange={(e) => handleChange('store_name', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="supportEmail" className="text-base font-medium">Support Email</Label>
                        <Input
                            id="supportEmail"
                            type="email"
                            placeholder="support@cedar.com"
                            value={formData.support_email}
                            onChange={(e) => handleChange('support_email', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="supportPhone" className="text-base font-medium">Support Phone</Label>
                        <Input
                            id="supportPhone"
                            placeholder="+91-XXXXXXXXXX"
                            value={formData.support_phone}
                            onChange={(e) => handleChange('support_phone', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>
                </div>
            </div>

            {/* About Cedar */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    About Cedar
                </h3>

                <div className="space-y-3">
                    <Label htmlFor="aboutCedar" className="text-base font-medium">Company Description</Label>
                    <Textarea
                        id="aboutCedar"
                        placeholder="Tell customers about Cedar Elevator Industries..."
                        value={formData.about_cedar}
                        onChange={(e) => handleChange('about_cedar', e.target.value)}
                        rows={6}
                        className="text-base"
                    />
                    <p className="text-sm text-gray-500">
                        This description will be displayed on the About Us page
                    </p>
                </div>
            </div>

            {/* Branding */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Branding
                </h3>

                <div className="space-y-3">
                    <Label className="text-base font-medium">Store Logo</Label>
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                            <span className="text-sm text-gray-400">LOGO</span>
                        </div>
                        <Button type="button" variant="outline" className="h-11 px-5 text-base">
                            <Upload className="mr-2 h-5 w-5" />
                            Upload / Replace
                        </Button>
                    </div>
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
    )
}
