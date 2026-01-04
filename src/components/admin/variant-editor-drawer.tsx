
"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, Warehouse, IndianRupee, Plus, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'

interface VariantEditorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    variant?: any
    productId: string
    productPrice?: number
    onSave: (variantData: any) => Promise<void>
    mode: 'create' | 'edit'
}

interface VariantOption {
    name: string
    value: string
}

export function VariantEditorDrawer({
    open,
    onOpenChange,
    variant,
    productId,
    productPrice = 0,
    onSave,
    mode
}: VariantEditorProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [options, setOptions] = useState<VariantOption[]>([
        { name: '', value: '' }
    ])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<string | null>(null) // Base64 string

    // Initialize form data
    const [formData, setFormData] = useState({
        price: variant?.price || productPrice || '',
        compare_at_price: variant?.compare_at_price || '',
        cost_per_item: variant?.cost_per_item || '',
        inventory_quantity: variant?.inventory_quantity || 0,
        status: variant?.status || 'active',
        image_url: variant?.image_url || '',
    })

    // Initialize state from variant data
    useEffect(() => {
        if (variant && mode === 'edit') {
            const newOptions: VariantOption[] = []
            if (variant.option1_name) newOptions.push({ name: variant.option1_name, value: variant.option1_value || '' })
            if (variant.option2_name) newOptions.push({ name: variant.option2_name, value: variant.option2_value || '' })
            if (variant.option3_name) newOptions.push({ name: variant.option3_name, value: variant.option3_value || '' })

            if (newOptions.length > 0) {
                setOptions(newOptions)
            } else {
                setOptions([{ name: '', value: '' }])
            }

            setFormData({
                price: variant.price || productPrice || '',
                compare_at_price: variant.compare_at_price || '',
                cost_per_item: variant.cost_per_item || '',
                inventory_quantity: variant.inventory_quantity || 0,
                status: variant.status || 'active',
                image_url: variant.image_url || '',
            })
            setPreviewUrl(variant.image_url || null)
            setSelectedFile(null)
        } else if (mode === 'create') {
            setOptions([{ name: '', value: '' }])
            setFormData({
                price: productPrice || '',
                compare_at_price: '',
                cost_per_item: '',
                inventory_quantity: 0,
                status: 'active',
                image_url: '',
            })
            setPreviewUrl(null)
            setSelectedFile(null)
        }
    }, [variant, mode, productPrice, open])

    const handleOptionChange = (index: number, field: 'name' | 'value', value: string) => {
        const newOptions = [...options]
        newOptions[index][field] = value
        setOptions(newOptions)
    }

    const addOption = () => {
        if (options.length < 3) {
            setOptions([...options, { name: '', value: '' }])
        }
    }

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index)
        setOptions(newOptions)
    }

    const generateVariantName = () => {
        const validOptions = options.filter(opt => opt.name && opt.value)
        if (validOptions.length === 0) return 'Default Variant'
        return validOptions.map(opt => opt.value).join(' / ')
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size too large (max 5MB)")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setSelectedFile(base64)
            setPreviewUrl(base64)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setPreviewUrl(null)
        setSelectedFile(null)
        setFormData(prev => ({ ...prev, image_url: '' }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)

            // Validate options
            const validOptions = options.filter(opt => opt.name.trim() !== '' && opt.value.trim() !== '')
            if (validOptions.length === 0 && mode === 'create') {
                // It's allowed to create a default variant without options if strictly necessary, 
                // but typically we want at least one or a name.
                // Let's assume auto-generated name "Default" if no options.
            }

            const variantName = generateVariantName()

            const payload: any = {
                ...formData,
                name: variantName,
                image_file: selectedFile, // Add base64 file if selected
                // Map options to option1, option2, option3
                option1_name: validOptions[0]?.name || null,
                option1_value: validOptions[0]?.value || null,
                option2_name: validOptions[1]?.name || null,
                option2_value: validOptions[1]?.value || null,
                option3_name: validOptions[2]?.name || null,
                option3_value: validOptions[2]?.value || null,
            }

            await onSave(payload)
            toast.success(mode === 'create' ? 'Variant created successfully' : 'Variant updated successfully')
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to save variant')
        } finally {
            setIsSaving(false)
        }
    }

    const getStockStatus = () => {
        if (formData.inventory_quantity === 0) return { label: 'Out of Stock', color: 'destructive' as const }
        if (formData.inventory_quantity < 10) return { label: 'Low Stock', color: 'secondary' as const }
        return { label: 'In Stock', color: 'default' as const }
    }

    const stockStatus = getStockStatus()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto bg-white p-0">
                <div className="px-6 py-6 h-full flex flex-col">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            {mode === 'create' ? 'Add New Variant' : 'Edit Variant'}
                        </SheetTitle>
                        <SheetDescription>
                            {mode === 'create'
                                ? 'Create a new variant by defining its options'
                                : 'Update variant details and options'
                            }
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 space-y-8">
                        {/* Variant Options */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Variant Options
                                </h3>
                                {options.length < 3 && (
                                    <Button variant="ghost" size="sm" onClick={addOption} className="text-orange-600">
                                        <Plus className="w-4 h-4 mr-1" /> Add Option
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-3 items-end">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-gray-500">Option Name</Label>
                                            <Input
                                                placeholder="e.g. Size, Color"
                                                value={option.name}
                                                onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-gray-500">Option Value</Label>
                                            <Input
                                                placeholder="e.g. Large, Red"
                                                value={option.value}
                                                onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        {options.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(index)}
                                                className="mb-0.5 text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500">
                                Preview Name: <span className="font-medium text-gray-900">{generateVariantName()}</span>
                            </p>
                        </div>

                        <Separator />

                        {/* Variant Image */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Variant Image
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="relative w-24 h-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden group">
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Variant Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button size="icon" variant="destructive" className="h-6 w-6" onClick={removeImage}>
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm text-gray-500">
                                        Upload an image specific to this variant. It will override the product's main image when selected.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Image
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Pricing */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" />
                                Pricing
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="compare_at_price">Compare Price (₹)</Label>
                                    <Input
                                        id="compare_at_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.compare_at_price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                                        placeholder="Optional"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost_per_item">Cost per Item (₹)</Label>
                                <Input
                                    id="cost_per_item"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.cost_per_item}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cost_per_item: e.target.value }))}
                                    placeholder="Optional"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Inventory */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Warehouse className="w-4 h-4" />
                                Inventory
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="inventory_quantity">Stock Quantity</Label>
                                <Input
                                    id="inventory_quantity"
                                    type="number"
                                    min="0"
                                    value={formData.inventory_quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: parseInt(e.target.value) || 0 }))}
                                    disabled={isSaving}
                                />
                                <Badge variant={stockStatus.color} className="mt-1">{stockStatus.label}</Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Active Status</Label>
                                <p className="text-sm text-gray-500">Make this variant available for sale</p>
                            </div>
                            <Switch
                                checked={formData.status === 'active'}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'draft' }))}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <SheetFooter className="mt-6">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? 'Saving...' : mode === 'create' ? 'Create Variant' : 'Save Changes'}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}

