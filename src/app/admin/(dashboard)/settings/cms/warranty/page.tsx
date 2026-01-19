"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ShieldCheck, Clock, FileText, Boxes, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import {
    getWarrantyDataAction,
    updateWarrantyHeroAction,
    updateWarrantyPeriodAction,
    bulkSaveWarrantyCoverageAction,
    bulkSaveWarrantyClaimStepsAction,
    getApplicationsForWarrantyAction,
    getCategoriesForWarrantyAction,
    getSubcategoriesForWarrantyAction,
    type WarrantyData,
    type WarrantyCoverage,
    type WarrantyClaimStep
} from "@/lib/actions/warranty-cms"

type LevelType = 'application' | 'category' | 'subcategory'

interface ReferenceItem {
    id: string
    name: string
}

export default function WarrantyCMSPage() {
    // Data states
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Hero section
    const [heroTitle, setHeroTitle] = useState("")
    const [heroDescription, setHeroDescription] = useState("")

    // Period section
    const [periodMonths, setPeriodMonths] = useState(12)
    const [periodType, setPeriodType] = useState("")
    const [periodAppliesTo, setPeriodAppliesTo] = useState("")

    // Coverage section
    const [levelType, setLevelType] = useState<LevelType>('category')
    const [referenceItems, setReferenceItems] = useState<ReferenceItem[]>([])
    const [coverageItems, setCoverageItems] = useState<Array<{
        id?: string
        reference_id: string | null
        reference_name: string
        duration: string
        coverage_text: string
    }>>([])

    // Claim steps section
    const [claimSteps, setClaimSteps] = useState<Array<{
        id?: string
        step_number: number
        title: string
        description: string
    }>>([])

    // Load initial data
    useEffect(() => {
        loadData()
    }, [])

    // Load reference items when level type changes
    useEffect(() => {
        loadReferenceItems()
    }, [levelType])

    async function loadData() {
        setIsLoading(true)
        const result = await getWarrantyDataAction()

        if (result.data) {
            // Hero
            setHeroTitle(result.data.hero?.title || "")
            setHeroDescription(result.data.hero?.description || "")

            // Period
            setPeriodMonths(result.data.period?.months || 12)
            setPeriodType(result.data.period?.warranty_type || "")
            setPeriodAppliesTo(result.data.period?.applies_to || "")

            // Coverage - filter by current level type
            const existingCoverage = result.data.coverage || []
            const filteredCoverage = existingCoverage
                .filter(c => c.level_type === levelType)
                .map(c => ({
                    id: c.id,
                    reference_id: c.reference_id,
                    reference_name: c.reference_name,
                    duration: c.duration,
                    coverage_text: c.coverage_text
                }))
            setCoverageItems(filteredCoverage)

            // Claim steps
            setClaimSteps(result.data.claimSteps?.map(s => ({
                id: s.id,
                step_number: s.step_number,
                title: s.title,
                description: s.description
            })) || [])
        } else if (result.error) {
            toast.error(result.error)
        }

        setIsLoading(false)
        setHasChanges(false)
    }

    async function loadReferenceItems() {
        let result: { data: ReferenceItem[]; error: string | null } = { data: [], error: null }

        switch (levelType) {
            case 'application':
                result = await getApplicationsForWarrantyAction()
                break
            case 'category':
                result = await getCategoriesForWarrantyAction()
                break
            case 'subcategory':
                result = await getSubcategoriesForWarrantyAction()
                break
        }

        if (result.error) {
            toast.error(result.error)
        } else {
            setReferenceItems(result.data)

            // Initialize coverage items with all reference items
            const existingMap = new Map(coverageItems.map(c => [c.reference_id, c]))
            const newItems = result.data.map(item => {
                const existing = existingMap.get(item.id)
                return existing || {
                    reference_id: item.id,
                    reference_name: item.name,
                    duration: "",
                    coverage_text: ""
                }
            })
            setCoverageItems(newItems)
        }
    }

    function handleCoverageChange(index: number, field: string, value: string) {
        const updated = [...coverageItems]
        updated[index] = { ...updated[index], [field]: value }
        setCoverageItems(updated)
        setHasChanges(true)
    }

    function handleClaimStepChange(index: number, field: string, value: string) {
        const updated = [...claimSteps]
        updated[index] = { ...updated[index], [field]: value }
        setClaimSteps(updated)
        setHasChanges(true)
    }

    async function handleSaveAll() {
        setIsSaving(true)
        let hasErrors = false

        // Save hero
        const heroResult = await updateWarrantyHeroAction({ title: heroTitle, description: heroDescription })
        if (heroResult.error) {
            toast.error(`Hero: ${heroResult.error}`)
            hasErrors = true
        }

        // Save period
        const periodResult = await updateWarrantyPeriodAction({
            months: periodMonths,
            warranty_type: periodType,
            applies_to: periodAppliesTo
        })
        if (periodResult.error) {
            toast.error(`Period: ${periodResult.error}`)
            hasErrors = true
        }

        // Save coverage (only items with duration set)
        const validCoverage = coverageItems.filter(c => c.duration.trim() !== "")
        if (validCoverage.length > 0) {
            const coverageResult = await bulkSaveWarrantyCoverageAction(
                validCoverage.map(c => ({
                    id: c.id,
                    level_type: levelType,
                    reference_id: c.reference_id,
                    reference_name: c.reference_name,
                    duration: c.duration,
                    coverage_text: c.coverage_text
                }))
            )
            if (coverageResult.error) {
                toast.error(`Coverage: ${coverageResult.error}`)
                hasErrors = true
            }
        }

        // Save claim steps
        if (claimSteps.length > 0) {
            const stepsResult = await bulkSaveWarrantyClaimStepsAction(claimSteps)
            if (stepsResult.error) {
                toast.error(`Claim Steps: ${stepsResult.error}`)
                hasErrors = true
            }
        }

        setIsSaving(false)

        if (!hasErrors) {
            toast.success("All changes saved successfully!")
            setHasChanges(false)
            loadData()
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Warranty Information</h1>
                    <p className="text-sm text-gray-600">Manage the content for the Warranty page</p>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={!hasChanges || isSaving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    {isSaving ? (
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Save All Changes
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="hero" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        Hero
                    </TabsTrigger>
                    <TabsTrigger value="period" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        Warranty Period
                    </TabsTrigger>
                    <TabsTrigger value="coverage" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        Coverage
                    </TabsTrigger>
                    <TabsTrigger value="claim" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        How to Claim
                    </TabsTrigger>
                </TabsList>

                {/* Hero Tab */}
                <TabsContent value="hero">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Hero Section
                            </CardTitle>
                            <CardDescription>Edit the page title and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Page Title</Label>
                                <Input
                                    value={heroTitle}
                                    onChange={(e) => { setHeroTitle(e.target.value); setHasChanges(true) }}
                                    placeholder="Warranty Information"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={heroDescription}
                                    onChange={(e) => { setHeroDescription(e.target.value); setHasChanges(true) }}
                                    placeholder="Peace of mind included..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Period Tab */}
                <TabsContent value="period">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Warranty Period Card
                            </CardTitle>
                            <CardDescription>Edit the warranty period information shown in the big card</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Warranty Period (Months)</Label>
                                <Input
                                    type="number"
                                    value={periodMonths}
                                    onChange={(e) => { setPeriodMonths(parseInt(e.target.value) || 12); setHasChanges(true) }}
                                    placeholder="12"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Warranty Type</Label>
                                <Input
                                    value={periodType}
                                    onChange={(e) => { setPeriodType(e.target.value); setHasChanges(true) }}
                                    placeholder="Limited Manufacturing Warranty"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Applies To</Label>
                                <Input
                                    value={periodAppliesTo}
                                    onChange={(e) => { setPeriodAppliesTo(e.target.value); setHasChanges(true) }}
                                    placeholder="All Cedar Components"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Coverage Tab */}
                <TabsContent value="coverage">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Boxes className="h-5 w-5 text-purple-600" />
                                Warranty Coverage
                            </CardTitle>
                            <CardDescription>Set warranty coverage by application, category, or subcategory</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Coverage Level</Label>
                                <Select
                                    value={levelType}
                                    onValueChange={(value) => setLevelType(value as LevelType)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="application">Application Level</SelectItem>
                                        <SelectItem value="category">Category Level</SelectItem>
                                        <SelectItem value="subcategory">Subcategory Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Coverage Items Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                {levelType === 'application' ? 'Application' :
                                                    levelType === 'category' ? 'Category' : 'Subcategory'}
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">Duration</th>
                                            <th className="px-4 py-3 text-left font-medium">Coverage Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {coverageItems.map((item, index) => (
                                            <tr key={item.reference_id || index}>
                                                <td className="px-4 py-3 font-medium">{item.reference_name}</td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        value={item.duration}
                                                        onChange={(e) => handleCoverageChange(index, 'duration', e.target.value)}
                                                        placeholder="e.g., 2 Years"
                                                        className="h-8"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        value={item.coverage_text}
                                                        onChange={(e) => handleCoverageChange(index, 'coverage_text', e.target.value)}
                                                        placeholder="What's covered..."
                                                        className="h-8"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {coverageItems.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                    No items found for this level type. Add some {levelType}s first.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Claim Tab */}
                <TabsContent value="claim">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-600" />
                                How to Claim
                            </CardTitle>
                            <CardDescription>Edit the claim process steps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {claimSteps.map((step, index) => (
                                <div key={step.id || index} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                            {step.step_number}
                                        </div>
                                        <Input
                                            value={step.title}
                                            onChange={(e) => handleClaimStepChange(index, 'title', e.target.value)}
                                            placeholder="Step title"
                                            className="flex-1"
                                        />
                                    </div>
                                    <Textarea
                                        value={step.description}
                                        onChange={(e) => handleClaimStepChange(index, 'description', e.target.value)}
                                        placeholder="Step description"
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
