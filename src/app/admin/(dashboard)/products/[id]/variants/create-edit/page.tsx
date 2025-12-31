"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface VariantFormData {
    sku: string
    price: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity: number
    low_stock_threshold?: number
    weight?: number
    dimensions?: string
    barcode?: string
    is_active: boolean
}

export default function VariantCreateEditPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const variantId = searchParams.get("variantId")
    const isEdit = !!variantId

    const [formData, setFormData] = useState<VariantFormData>({
        sku: "",
        price: 0,
        compare_at_price: undefined,
        cost_per_item: undefined,
        stock_quantity: 0,
        low_stock_threshold: 10,
        weight: undefined,
        dimensions: "",
        barcode: "",
        is_active: true
    })

    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(isEdit)

    // Fetch variant data if editing
    useEffect(() => {
        if (isEdit && variantId) {
            // TODO: Fetch variant data
            setIsFetching(false)
        }
    }, [isEdit, variantId])

    const handleSubmit = async () => {
        try {
            if (!formData.sku || formData.price <= 0) {
                toast.error("Please fill in required fields")
                return
            }

            setIsLoading(true)

            // TODO: Implement create/update variant logic
            // const result = isEdit 
            //   ? await updateVariant(variantId, formData)
            //   : await createVariant(params.id, formData)

            toast.success(isEdit ? "Variant updated successfully!" : "Variant created successfully!")
            router.push(`/admin/products/${params.id}/variants`)
        } catch (error) {
            console.error("Error saving variant:", error)
            toast.error("Failed to save variant")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {isEdit ? "Edit Variant" : "Create Variant"}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEdit ? "Update variant details" : "Add a new product variant"}
                        </p>
                    </div>
                    <Button variant="outline" asChild className="border-gray-300 bg-white">
                        <Link href={`/admin/products/${params.id}/variants`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Essential variant details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU *</Label>
                                        <Input
                                            id="sku"
                                            placeholder="e.g., PROD-001-BLK"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barcode">Barcode</Label>
                                        <Input
                                            id="barcode"
                                            placeholder="e.g., 123456789012"
                                            value={formData.barcode || ""}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>Set pricing information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="compare_at_price">Compare at Price</Label>
                                        <Input
                                            id="compare_at_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.compare_at_price || ""}
                                            onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || undefined })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cost_per_item">Cost per Item</Label>
                                        <Input
                                            id="cost_per_item"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.cost_per_item || ""}
                                            onChange={(e) => setFormData({ ...formData, cost_per_item: parseFloat(e.target.value) || undefined })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>Stock and inventory settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                                        <Input
                                            id="stock_quantity"
                                            type="number"
                                            min="0"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                                        <Input
                                            id="low_stock_threshold"
                                            type="number"
                                            min="0"
                                            value={formData.low_stock_threshold || ""}
                                            onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping</CardTitle>
                                <CardDescription>Physical properties</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.weight || ""}
                                            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dimensions">Dimensions (L×W×H cm)</Label>
                                        <Input
                                            id="dimensions"
                                            placeholder="e.g., 10×20×30"
                                            value={formData.dimensions || ""}
                                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_active">Active</Label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEdit ? "Update Variant" : "Create Variant"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
