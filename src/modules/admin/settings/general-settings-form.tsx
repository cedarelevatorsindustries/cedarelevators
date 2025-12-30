"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getStoreSettings, updateStoreSettings } from "@/lib/services/settings"
import { StoreSettings } from "@/lib/types/settings"
import { LoaderCircle, Save } from "lucide-react"
import { useSettings } from "@/modules/admin/settings/settings-context"

export function GeneralSettingsForm() {
    const { registerSaveHandler, unregisterSaveHandler } = useSettings()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [settings, setSettings] = useState<StoreSettings | null>(null)
    const [formData, setFormData] = useState({
        store_name: "",
        support_email: "",
        support_phone: "",
        whatsapp_number: "",
        invoice_prefix: "CEI",
        currency: "INR",
        timezone: "Asia/Kolkata",
        about_cedar: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        business_hours_mon_sat: "",
        business_hours_sun: "",
        social_instagram: "",
        social_facebook: ""
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

                // Parse business hours safely
                const hours = result.data.business_hours || {}
                // Parse social media safely
                const social = result.data.social_media || {}

                setFormData({
                    store_name: result.data.store_name || "",
                    support_email: result.data.support_email || "",
                    support_phone: result.data.support_phone || "",
                    whatsapp_number: result.data.whatsapp_number || "",
                    invoice_prefix: result.data.invoice_prefix || "CEI",
                    currency: result.data.currency || "INR",
                    timezone: result.data.timezone || "Asia/Kolkata",
                    about_cedar: result.data.about_cedar || "",
                    address_line1: result.data.address_line1 || "",
                    address_line2: result.data.address_line2 || "",
                    city: result.data.city || "",
                    state: result.data.state || "",
                    postal_code: result.data.postal_code || "",
                    country: result.data.country || "India",
                    business_hours_mon_sat: hours.mon_sat || "9:30 AM - 7:00 PM",
                    business_hours_sun: hours.sun || "Closed",
                    social_instagram: social.instagram || "",
                    social_facebook: social.facebook || ""
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
            const payload = {
                store_name: formData.store_name,
                support_email: formData.support_email,
                support_phone: formData.support_phone,
                whatsapp_number: formData.whatsapp_number,
                invoice_prefix: formData.invoice_prefix,
                currency: formData.currency,
                timezone: formData.timezone,
                about_cedar: formData.about_cedar,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                country: formData.country,
                business_hours: {
                    mon_sat: formData.business_hours_mon_sat,
                    sun: formData.business_hours_sun
                },
                social_media: {
                    instagram: formData.social_instagram,
                    facebook: formData.social_facebook
                }
            }

            const result = await updateStoreSettings(settings.id, payload)
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

                    <div className="grid md:grid-cols-2 gap-5">
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

                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <Label htmlFor="whatsappNumber" className="text-base font-medium">WhatsApp Number</Label>
                            <Input
                                id="whatsappNumber"
                                placeholder="+91-XXXXXXXXXX"
                                value={formData.whatsapp_number}
                                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Location */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Store Location
                </h3>

                <div className="space-y-5">
                    <div className="space-y-3">
                        <Label htmlFor="addressLine1" className="text-base font-medium">Address Line 1</Label>
                        <Input
                            id="addressLine1"
                            placeholder="Plot / Street / Building"
                            value={formData.address_line1}
                            onChange={(e) => handleChange('address_line1', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="addressLine2" className="text-base font-medium">Address Line 2</Label>
                        <Input
                            id="addressLine2"
                            placeholder="Area / Landmark"
                            value={formData.address_line2}
                            onChange={(e) => handleChange('address_line2', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <Label htmlFor="city" className="text-base font-medium">City</Label>
                            <Input
                                id="city"
                                placeholder="Chennai"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="state" className="text-base font-medium">State</Label>
                            <Input
                                id="state"
                                placeholder="Tamil Nadu"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <Label htmlFor="postalCode" className="text-base font-medium">Postal Code</Label>
                            <Input
                                id="postalcode"
                                placeholder="600000"
                                value={formData.postal_code}
                                onChange={(e) => handleChange('postal_code', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="country" className="text-base font-medium">Country</Label>
                            <Input
                                id="country"
                                placeholder="India"
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Business Hours
                </h3>

                <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <Label htmlFor="hoursMonSat" className="text-base font-medium">Monday - Saturday</Label>
                            <Input
                                id="hoursMonSat"
                                placeholder="9:30 AM - 7:00 PM"
                                value={formData.business_hours_mon_sat}
                                onChange={(e) => handleChange('business_hours_mon_sat', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="hoursSun" className="text-base font-medium">Sunday</Label>
                            <Input
                                id="hoursSun"
                                placeholder="Closed"
                                value={formData.business_hours_sun}
                                onChange={(e) => handleChange('business_hours_sun', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Social Media Channels
                </h3>

                <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <Label htmlFor="socialInstagram" className="text-base font-medium">Instagram</Label>
                            <Input
                                id="socialInstagram"
                                placeholder="https://instagram.com/..."
                                value={formData.social_instagram}
                                onChange={(e) => handleChange('social_instagram', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="socialFacebook" className="text-base font-medium">Facebook</Label>
                            <Input
                                id="socialFacebook"
                                placeholder="https://facebook.com/..."
                                value={formData.social_facebook}
                                onChange={(e) => handleChange('social_facebook', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
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
