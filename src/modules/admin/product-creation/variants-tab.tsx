"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, X, Settings, Image, Zap, Ruler, Weight, Activity } from "lucide-react"

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

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: string
  mrp: string
  stock: string
  active: boolean
  image?: string
  combinations: { [optionId: string]: string }
}

interface VariantsTabProps {
  options: VariantOption[]
  variants: ProductVariant[]
  onOptionsChange: (options: VariantOption[]) => void
  onVariantsChange: (variants: ProductVariant[]) => void
}

export function VariantsTab({ options, variants, onOptionsChange, onVariantsChange }: VariantsTabProps) {
  const [activeTab, setActiveTab] = useState("configure")
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkMrp, setBulkMrp] = useState("")
  const [bulkStock, setBulkStock] = useState("")
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)

  const applyBulkEdit = () => {
    const updates: Partial<ProductVariant> = {}
    if (bulkPrice) updates.price = bulkPrice
    if (bulkMrp) updates.mrp = bulkMrp
    if (bulkStock) updates.stock = bulkStock

    if (Object.keys(updates).length > 0) {
      onVariantsChange(
        variants.map(variant => ({ ...variant, ...updates }))
      )
    }
    setIsBulkEditOpen(false)
    setBulkPrice("")
    setBulkMrp("")
    setBulkStock("")
  }

  const addOption = () => {
    const newOption: VariantOption = {
      id: `option-${Date.now()}`,
      name: "",
      type: 'custom',
      values: []
    }
    onOptionsChange([...options, newOption])
  }

  const updateOptionName = (optionId: string, name: string) => {
    onOptionsChange(
      options.map(option =>
        option.id === optionId ? { ...option, name } : option
      )
    )
  }

  const removeOption = (optionId: string) => {
    onOptionsChange(options.filter(option => option.id !== optionId))
  }

  const addOptionValue = (optionId: string) => {
    const newValue: VariantValue = {
      id: `value-${Date.now()}`,
      name: ""
    }

    onOptionsChange(
      options.map(opt =>
        opt.id === optionId
          ? { ...opt, values: [...opt.values, newValue] }
          : opt
      )
    )
  }

  const updateOptionValue = (optionId: string, valueId: string, name: string) => {
    onOptionsChange(
      options.map(option =>
        option.id === optionId
          ? {
            ...option,
            values: option.values.map(value =>
              value.id === valueId ? { ...value, name } : value
            )
          }
          : option
      )
    )
  }

  const removeOptionValue = (optionId: string, valueId: string) => {
    onOptionsChange(
      options.map(option =>
        option.id === optionId
          ? { ...option, values: option.values.filter(value => value.id !== valueId) }
          : option
      )
    )
  }

  const generateVariants = () => {
    if (options.length === 0) return

    const combinations: { [optionId: string]: string }[] = []

    const generateCombinations = (optionIndex: number, currentCombination: { [optionId: string]: string }) => {
      if (optionIndex >= options.length) {
        combinations.push({ ...currentCombination })
        return
      }

      const option = options[optionIndex]
      for (const value of option.values) {
        generateCombinations(optionIndex + 1, {
          ...currentCombination,
          [option.id]: value.id
        })
      }
    }

    generateCombinations(0, {})

    const newVariants: ProductVariant[] = combinations.map((combination, index) => {
      const variantName = options.map(option => {
        const valueId = combination[option.id]
        const value = option.values.find(v => v.id === valueId)
        return value?.name || ""
      }).join(" / ")

      const sku = `SKU-${options.map(option => {
        const valueId = combination[option.id]
        const value = option.values.find(v => v.id === valueId)
        return value?.name?.toUpperCase().replace(/\s+/g, "-") || ""
      }).join("-")}`

      return {
        id: `variant-${Date.now()}-${index}`,
        name: variantName,
        sku,
        price: "",
        mrp: "",
        stock: "0",
        active: true,
        combinations: combination
      }
    })

    onVariantsChange(newVariants)
    setActiveTab("matrix")
  }

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    onVariantsChange(
      variants.map(variant =>
        variant.id === variantId ? { ...variant, ...updates } : variant
      )
    )
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
            disabled={variants.length === 0}
          >
            Variant Matrix ({variants.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="configure" className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Define Product Options</CardTitle>
                <CardDescription>
                  Add attributes like Voltage, Speed, or Capacity to generate variations.
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
                            placeholder="e.g. Voltage, Capacity, Speed"
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
              </CardContent>
            </Card>

            {options.length > 0 && options.every(o => o.values.length > 0) && (
              <div className="flex justify-end">
                <Button onClick={generateVariants} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20">
                  <Activity className="mr-2 h-4 w-4" />
                  Generate {options.reduce((acc, curr) => acc * curr.values.length, 1)} Variants
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Variant Pricing & Inventory</CardTitle>
                  <CardDescription>
                    Manage SKU, Price, and Stock for each specific variation.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("configure")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Reconfigure Options
                </Button>
              </CardHeader>

              {/* Bulk Edit Section */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
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
                      <Label htmlFor="bulk-price" className="text-xs">Price for All</Label>
                      <Input
                        id="bulk-price"
                        placeholder="0.00"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="bulk-mrp" className="text-xs">Compare Price (MRP)</Label>
                      <Input
                        id="bulk-mrp"
                        placeholder="0.00"
                        value={bulkMrp}
                        onChange={(e) => setBulkMrp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="bulk-stock" className="text-xs">Stock for All</Label>
                      <Input
                        id="bulk-stock"
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

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[30%]">Variant</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Compare Price (₹)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <span className="font-medium text-gray-900">{variant.name}</span>
                          <div className="text-xs text-gray-500 flex gap-1 mt-1">
                            {Object.entries(variant.combinations).map(([key, value]) => {
                              // Find option name matching key (not efficient but fine for UI)
                              const optName = options.find(o => o.id === key)?.name;
                              const valName = options.find(o => o.id === key)?.values.find(v => v.id === value)?.name;
                              return <span key={key} className="bg-gray-100 px-1 rounded">{optName}: {valName}</span>
                            })}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, { price: e.target.value })}
                            className="h-8"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.mrp}
                            onChange={(e) => updateVariant(variant.id, { mrp: e.target.value })}
                            className="h-8"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, { stock: e.target.value })}
                            className="h-8 w-24"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={variant.active}
                            onCheckedChange={(c) => updateVariant(variant.id, { active: c })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs >
    </div >
  )
}
