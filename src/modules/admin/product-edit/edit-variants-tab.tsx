"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Settings, Edit2, Trash2, Plus, Zap, Image as ImageIcon, X, Activity } from "lucide-react"
import { VariantEditorDrawer } from "@/components/admin/variant-editor-drawer"
import { deleteVariant, createVariant, updateVariant, toggleVariantStatus } from "@/lib/actions/variants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

// Types matching the component logic
export interface VariantOption {
    id: string
    name: string
    type: string
    values: VariantValue[]
}

export interface VariantValue {
    id: string
    name: string
}

export interface EditVariantsTabProps {
    productId: string
    variants: any[]
    productPrice?: number
}

export function EditVariantsTab({ productId, variants: initialVariants, productPrice }: EditVariantsTabProps) {
    const router = useRouter()
    const [variants, setVariants] = useState<any[]>(initialVariants || [])
    const [options, setOptions] = useState<VariantOption[]>([])
    const [activeTab, setActiveTab] = useState("matrix")

    // Bulk Edit State
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [bulkPrice, setBulkPrice] = useState("")
    const [bulkStock, setBulkStock] = useState("")

    // Drawer State
    const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [variantEditorMode, setVariantEditorMode] = useState<'create' | 'edit'>('create')

    // Parse options from existing variants
    useEffect(() => {
        setVariants(initialVariants || [])

        // Only initialize options if they are empty (first load), to respect user edits in Configure tab
        if (options.length === 0 && initialVariants && initialVariants.length > 0) {
            const extractedOptions: VariantOption[] = []
            const optionNames = new Set<string>() // To preserve order
            const optionValuesMap = new Map<string, Set<string>>()

            // Pass 1: Collect all option names and values
            initialVariants.forEach(v => {
                if (v.option1_name) {
                    optionNames.add(v.option1_name)
                    if (!optionValuesMap.has(v.option1_name)) optionValuesMap.set(v.option1_name, new Set())
                    if (v.option1_value) optionValuesMap.get(v.option1_name)?.add(v.option1_value)
                }
                if (v.option2_name) {
                    optionNames.add(v.option2_name)
                    if (!optionValuesMap.has(v.option2_name)) optionValuesMap.set(v.option2_name, new Set())
                    if (v.option2_value) optionValuesMap.get(v.option2_name)?.add(v.option2_value)
                }
                if (v.option3_name) {
                    optionNames.add(v.option3_name)
                    if (!optionValuesMap.has(v.option3_name)) optionValuesMap.set(v.option3_name, new Set())
                    if (v.option3_value) optionValuesMap.get(v.option3_name)?.add(v.option3_value)
                }
            })

            // Pass 2: Structure them
            Array.from(optionNames).forEach((name, index) => {
                extractedOptions.push({
                    id: `opt-${index}`,
                    name: name,
                    type: 'custom',
                    values: Array.from(optionValuesMap.get(name) || []).map((val, vIndex) => ({
                        id: `val-${index}-${vIndex}`,
                        name: val
                    }))
                })
            })
            setOptions(extractedOptions)
            // Default to matrix if we loaded variants
            setActiveTab("matrix")
        } else if (!initialVariants || initialVariants.length === 0) {
            // Default to configure if no variants
            setActiveTab("configure")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialVariants])


    // --- Option Management Handlers (Same as VariantsTab) ---
    const addOption = () => {
        const newOption: VariantOption = {
            id: `option-${Date.now()}`,
            name: "",
            type: 'custom',
            values: []
        }
        setOptions([...options, newOption])
    }

    const updateOptionName = (optionId: string, name: string) => {
        setOptions(options.map(option => option.id === optionId ? { ...option, name } : option))
    }

    const removeOption = (optionId: string) => {
        setOptions(options.filter(option => option.id !== optionId))
    }

    const addOptionValue = (optionId: string) => {
        const newValue: VariantValue = {
            id: `value-${Date.now()}`,
            name: ""
        }
        setOptions(options.map(opt =>
            opt.id === optionId ? { ...opt, values: [...opt.values, newValue] } : opt
        ))
    }

    const updateOptionValue = (optionId: string, valueId: string, name: string) => {
        setOptions(options.map(option =>
            option.id === optionId
                ? {
                    ...option,
                    values: option.values.map(value =>
                        value.id === valueId ? { ...value, name } : value
                    )
                }
                : option
        ))
    }

    const removeOptionValue = (optionId: string, valueId: string) => {
        setOptions(options.map(option =>
            option.id === optionId
                ? { ...option, values: option.values.filter(value => value.id !== valueId) }
                : option
        ))
    }

    // --- Bulk Edit Logic ---
    const applyBulkEdit = async () => {
        const updates: any = {}
        if (bulkPrice) updates.price = parseFloat(bulkPrice)
        if (bulkStock) updates.inventory_quantity = parseInt(bulkStock)

        if (Object.keys(updates).length === 0) {
            toast.error("Please enter price or stock to apply")
            return
        }

        const toastId = toast.loading("Applying bulk updates...")

        try {
            await Promise.all(
                variants.map(variant =>
                    updateVariant(variant.id, productId, { ...variant, ...updates })
                )
            )
            toast.success("Bulk update applied successfully", { id: toastId })
            router.refresh()
            setIsBulkEditOpen(false)
            setBulkPrice("")
            setBulkStock("")
        } catch (error) {
            console.error(error)
            toast.error("Failed to apply bulk updates", { id: toastId })
        }
    }

    // --- Generate / Sync Logic ---
    const handleGenerateVariants = async () => {
        if (options.length === 0) {
            toast.error("Please define at least one option.")
            return
        }

        // 1. Generate all expected combinations
        const combinations: { [optionName: string]: string }[] = []
        const generateCombinations = (optionIndex: number, current: { [key: string]: string }) => {
            if (optionIndex >= options.length) {
                combinations.push({ ...current })
                return
            }
            const option = options[optionIndex]
            if (option.values.length === 0) {
                // If an option has no values, it means no combinations can be formed with it.
                // This might be an error state or intentional, depending on UX.
                // For now, we'll just not generate combinations for this branch.
                // Or, if we want to force combinations even with empty values, we'd need a default.
                // For now, if an option has no values, it won't contribute to combinations.
                // If ALL options have no values, combinations will be empty.
                return
            }

            for (const value of option.values) {
                if (!value.name) continue // Skip empty values
                generateCombinations(optionIndex + 1, {
                    ...current,
                    [option.name]: value.name
                })
            }
        }
        generateCombinations(0, {})

        if (combinations.length === 0) {
            toast.error("Please ensure all options have valid values to generate variants.")
            return
        }

        // 2. Identify New vs Obsolete variants
        const toCreate: any[] = []
        const toKeepIds = new Set<string>()

        combinations.forEach(combo => {
            // Find if this combo exists in current variants
            const existing = variants.find(v => {
                let match = true
                const comboEntries = Object.entries(combo)

                // Check if all combo entries match an option in the variant
                for (const [optName, optVal] of comboEntries) {
                    const vOpt1 = v.option1_name === optName && v.option1_value === optVal
                    const vOpt2 = v.option2_name === optName && v.option2_value === optVal
                    const vOpt3 = v.option3_name === optName && v.option3_value === optVal

                    if (!vOpt1 && !vOpt2 && !vOpt3) {
                        match = false
                        break
                    }
                }

                // Additionally, ensure the variant doesn't have *more* options than the combo defines,
                // unless the combo itself is defining fewer options than the variant *could* have.
                // This is a tricky part. For simplicity, we assume if the combo matches, it's the same variant.
                // A more robust check would be to ensure the number of defined options in `v` matches `comboEntries.length`.
                const vDefinedOptions = [v.option1_name, v.option2_name, v.option3_name].filter(Boolean).length;
                if (match && vDefinedOptions !== comboEntries.length) {
                    match = false; // Variant has a different number of options than the combo
                }

                return match
            })

            if (existing) {
                toKeepIds.add(existing.id)
            } else {
                // Create new
                // Map combo back to option1_name, etc.
                const newVar: any = {
                    name: Object.values(combo).join(" / "),
                    sku: `SKU-${Object.values(combo).map(s => s.toUpperCase().substring(0, 3)).join("-")}-${Math.random().toString(36).substr(2, 5)}`,
                    price: productPrice || 0,
                    status: 'active',
                    inventory_quantity: 0
                }

                // Assign options dynamically
                const entries = Object.entries(combo)
                if (entries[0]) { newVar.option1_name = entries[0][0]; newVar.option1_value = entries[0][1] }
                if (entries[1]) { newVar.option2_name = entries[1][0]; newVar.option2_value = entries[1][1] }
                if (entries[2]) { newVar.option3_name = entries[2][0]; newVar.option3_value = entries[2][1] }

                toCreate.push(newVar)
            }
        })

        const toDeleteIds = variants.filter(v => !toKeepIds.has(v.id)).map(v => v.id)

        // 3. Confirm and Execute
        if (toCreate.length === 0 && toDeleteIds.length === 0) {
            toast.info("No changes to variants detected.")
            setActiveTab("matrix")
            return
        }

        if (!confirm(`This will create ${toCreate.length} new variants and delete ${toDeleteIds.length} existing variants. Proceed?`)) {
            return
        }

        const toastId = toast.loading("Syncing variants...")

        try {
            // Execute deletions
            if (toDeleteIds.length > 0) {
                await Promise.all(toDeleteIds.map(id => deleteVariant(id, productId)))
            }

            // Execute creations
            if (toCreate.length > 0) {
                // Sequential to be safe/nice to DB? Or parallel? Parallel is usually fine for these amounts.
                await Promise.all(toCreate.map(v => createVariant(productId, v)))
            }

            toast.success("Variants synchronized successfully", { id: toastId })
            router.refresh()
            setActiveTab("matrix")

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync variants", { id: toastId })
        }
    }


    const handleEditVariant = (variant: any) => {
        setSelectedVariant(variant)
        setVariantEditorMode('edit')
        setIsVariantEditorOpen(true)
    }

    const handleCreateVariant = () => {
        setSelectedVariant(null)
        setVariantEditorMode('create')
        setIsVariantEditorOpen(true)
    }

    const handleDeleteVariant = async (variantId: string) => {
        if (confirm('Are you sure you want to delete this variant?')) {
            const result = await deleteVariant(variantId, productId)
            if (result.success) {
                toast.success('Variant deleted')
                router.refresh()
            } else {
                toast.error(result.error)
            }
        }
    }

    // Dedicated handler for status toggle - uses toggleVariantStatus instead of updateVariant
    const handleToggleStatus = async (variantId: string, newStatus: 'active' | 'draft') => {
        const result = await toggleVariantStatus(variantId, productId, newStatus)
        if (result.success) {
            toast.success(`Variant ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
            router.refresh()
        } else {
            toast.error(result.error || 'Failed to update status')
        }
    }

    const handleSaveVariant = async (data: any) => {
        if (variantEditorMode === 'create') {
            const result = await createVariant(productId, data)
            if (result.success) {
                toast.success('Variant created')
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } else {
            const result = await updateVariant(selectedVariant.id, productId, data)
            if (result.success) {
                toast.success('Variant updated')
                router.refresh()
            } else {
                toast.error(result.error)
            }
        }
        setIsVariantEditorOpen(false)
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 border-b border-gray-200">
                    <TabsTrigger
                        value="configure"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 px-4 py-2"
                    >
                        Configure Options
                    </TabsTrigger>
                    <TabsTrigger
                        value="matrix"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 px-4 py-2"
                    >
                        Variant Matrix ({variants.length})
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="configure" className="space-y-6">
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Define Product Options</CardTitle>
                                <CardDescription>
                                    Add attributes like Color, Size, or Material to generate variations.
                                    <br />
                                    <span className="text-orange-600 font-medium">Note: Changing options and regenerating will create new variants and potentially delete obsolete ones.</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {options.map((option, index) => (
                                    <div key={option.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col gap-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Option Name
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-gray-400">
                                                        {index === 0 ? <Zap className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                                    </div>
                                                    <Input
                                                        value={option.name}
                                                        onChange={(e) => updateOptionName(option.id, e.target.value)}
                                                        placeholder="e.g. Color, Size"
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(option.id)}
                                                className="text-gray-400 hover:text-red-600 self-end"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Option Values
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {option.values.map((value) => (
                                                    <div key={value.id} className="flex items-center bg-white border border-gray-200 rounded-md pl-3 pr-1 py-1 shadow-sm">
                                                        <Input
                                                            className="border-0 bg-transparent h-6 w-24 p-0 text-sm focus-visible:ring-0"
                                                            value={value.name}
                                                            onChange={(e) => updateOptionValue(option.id, value.id, e.target.value)}
                                                            placeholder="Value"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-1 text-gray-400 hover:text-red-500"
                                                            onClick={() => removeOptionValue(option.id, value.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addOptionValue(option.id)}
                                                    className="h-8 border-dashed text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Value
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button onClick={addOption} variant="outline" className="w-full py-4 border-dashed border-gray-300 text-gray-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Another Option Type
                                </Button>

                                {options.length > 0 && options.every(o => o.values.length > 0 && o.name.trim() !== '') && (
                                    <div className="flex justify-end border-t pt-6">
                                        <Button
                                            onClick={handleGenerateVariants}
                                            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                                        >
                                            <Activity className="mr-2 h-4 w-4" />
                                            Update Variants ({options.reduce((acc, curr) => acc * curr.values.filter(v => v.name.trim() !== '').length, 1)} Combinations)
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="matrix" className="space-y-6">
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Variant Matrix</CardTitle>
                                    <CardDescription>
                                        Manage pricing, stock, and visibility for each variant.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleCreateVariant} className="bg-orange-600 hover:bg-orange-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Variant
                                </Button>
                            </CardHeader>

                            {/* Bulk Edit Section */}
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-900">Bulk Edit Variants</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsBulkEditOpen(!isBulkEditOpen)}
                                        className="text-orange-600"
                                    >
                                        {isBulkEditOpen ? "Hide Bulk Edit" : "Show Bulk Edit"}
                                    </Button>
                                </div>

                                {isBulkEditOpen && (
                                    <div className="flex items-end gap-4 p-4 bg-white rounded-md border border-gray-200">
                                        <div className="space-y-2 flex-1">
                                            <Label htmlFor="bulk-price" className="text-xs">Price for All (₹)</Label>
                                            <Input
                                                id="bulk-price"
                                                type="number"
                                                placeholder="0.00"
                                                value={bulkPrice}
                                                onChange={(e) => setBulkPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label htmlFor="bulk-stock" className="text-xs">Stock for All</Label>
                                            <Input
                                                id="bulk-stock"
                                                type="number"
                                                placeholder="0"
                                                value={bulkStock}
                                                onChange={(e) => setBulkStock(e.target.value)}
                                            />
                                        </div>
                                        <Button onClick={applyBulkEdit} className="bg-orange-600 hover:bg-orange-700 text-white">
                                            Apply to All
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <CardContent>
                                {/* Desktop View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50">
                                                <TableHead className="w-[80px]">Image</TableHead>
                                                <TableHead>Variant</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Inventory</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {variants.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        No variants created yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                variants.map((variant) => (
                                                    <TableRow key={variant.id}>
                                                        <TableCell>
                                                            <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                                                                {variant.image_url ? (
                                                                    <img src={variant.image_url} alt={variant.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <ImageIcon className="h-4 w-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {variant.name}
                                                            <div className="text-xs text-gray-500">{variant.sku}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            ₹{variant.price}
                                                            {variant.compare_at_price && (
                                                                <span className="ml-2 text-xs text-gray-400 line-through">
                                                                    ₹{variant.compare_at_price}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span>{variant.inventory_quantity}</span>
                                                                {variant.inventory_quantity <= 5 && (
                                                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Low</Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={variant.status === 'active'}
                                                                onCheckedChange={(checked) => handleToggleStatus(variant.id, checked ? 'active' : 'draft')}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditVariant(variant)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleDeleteVariant(variant.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            <VariantEditorDrawer
                open={isVariantEditorOpen}
                onOpenChange={setIsVariantEditorOpen}
                variant={selectedVariant}
                productId={productId}
                productPrice={productPrice}
                onSave={handleSaveVariant}
                mode={variantEditorMode}
            />
        </div>
    )
}

