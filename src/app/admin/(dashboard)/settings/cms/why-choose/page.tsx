"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    LoaderCircle, Save, Plus, Trash2, GripVertical, Eye, EyeOff, Pencil,
    ShieldCheck, Globe, Wrench, Truck, Star, Package, Users, Award, Check, ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    getWhyChooseDataAction,
    updateHeroAction,
    createItemAction,
    updateItemAction,
    deleteItemAction,
    updateStatAction,
    updateCTAAction,
    type WhyChooseData,
    type WhyChooseItem
} from "@/lib/actions/why-choose-cms"

// Available icons for selection
const AVAILABLE_ICONS = [
    { name: "ShieldCheck", icon: ShieldCheck },
    { name: "Globe", icon: Globe },
    { name: "Wrench", icon: Wrench },
    { name: "Truck", icon: Truck },
    { name: "Star", icon: Star },
    { name: "Package", icon: Package },
    { name: "Users", icon: Users },
    { name: "Award", icon: Award },
]

export default function WhyChooseCMSPage() {
    const [data, setData] = useState<WhyChooseData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Local state for editing
    const [heroData, setHeroData] = useState({ title: "", description: "" })
    const [itemsData, setItemsData] = useState<WhyChooseItem[]>([])
    const [statsData, setStatsData] = useState<any[]>([])
    const [ctaData, setCtaData] = useState({ title: "", description: "" })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const result = await getWhyChooseDataAction()
        if (result.data) {
            setData(result.data)
            setHeroData({
                title: result.data.hero?.title || "",
                description: result.data.hero?.description || ""
            })
            setItemsData(result.data.items || [])
            setStatsData(result.data.stats || [])
            setCtaData({
                title: result.data.cta?.title || "",
                description: result.data.cta?.description || ""
            })
        } else {
            toast.error(result.error || "Failed to load data")
        }
        setIsLoading(false)
        setHasChanges(false)
    }

    const handleSaveAll = async () => {
        console.log('🟢 handleSaveAll started')
        console.log('📊 Hero Data:', heroData)
        console.log('📊 Stats Data:', statsData)
        console.log('📊 CTA Data:', ctaData)

        setIsSaving(true)
        let hasErrors = false

        // Save hero
        console.log('💾 Saving hero...')
        const heroResult = await updateHeroAction(heroData)
        console.log('📥 Hero result:', heroResult)
        if (heroResult.error) {
            toast.error(`Hero: ${heroResult.error}`)
            hasErrors = true
        }

        // Save stats
        console.log('💾 Saving stats...')
        for (const stat of statsData) {
            const { id, ...statData } = stat
            console.log(`💾 Saving stat ${id}:`, statData)
            const statResult = await updateStatAction(id, statData)
            console.log(`📥 Stat ${id} result:`, statResult)
            if (statResult.error) {
                toast.error(`Stats: ${statResult.error}`)
                hasErrors = true
            }
        }

        // Save CTA
        console.log('💾 Saving CTA...')
        const ctaResult = await updateCTAAction(ctaData)
        console.log('📥 CTA result:', ctaResult)
        if (ctaResult.error) {
            toast.error(`CTA: ${ctaResult.error}`)
            hasErrors = true
        }

        setIsSaving(false)

        if (!hasErrors) {
            console.log('✅ All saves completed successfully')
            toast.success("All changes saved successfully!")
            setHasChanges(false)
            loadData()
        } else {
            console.log('❌ Some saves failed')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Failed to load Why Choose Cedar data</p>
                <Button onClick={loadData} className="mt-4">Retry</Button>
            </div>
        )
    }

    return (
        <div className="max-w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Why Choose Cedar</h1>
                    <p className="text-gray-500 mt-1">
                        Manage the content for the "Why Choose Cedar" page
                    </p>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving || !hasChanges}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save All Changes"}
                </Button>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="hero" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Hero</TabsTrigger>
                    <TabsTrigger value="items" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Excellence Items</TabsTrigger>
                    <TabsTrigger value="stats" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Stats</TabsTrigger>
                    <TabsTrigger value="cta" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">CTA</TabsTrigger>
                </TabsList>

                <TabsContent value="hero">
                    <HeroSection
                        data={heroData}
                        onChange={(newData: { title: string; description: string }) => {
                            setHeroData(newData)
                            setHasChanges(true)
                        }}
                    />
                </TabsContent>

                <TabsContent value="items">
                    <ItemsSection
                        data={itemsData}
                        onChange={(newData: WhyChooseItem[]) => {
                            setItemsData(newData)
                            setHasChanges(true)
                        }}
                        onReload={loadData}
                    />
                </TabsContent>

                <TabsContent value="stats">
                    <StatsSection
                        data={statsData}
                        onChange={(newData: any[]) => {
                            setStatsData(newData)
                            setHasChanges(true)
                        }}
                    />
                </TabsContent>

                <TabsContent value="cta">
                    <CTASection
                        data={ctaData}
                        onChange={(newData: { title: string; description: string }) => {
                            setCtaData(newData)
                            setHasChanges(true)
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Icon Selector Component
function IconSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false)
    const selectedIcon = AVAILABLE_ICONS.find(icon => icon.name === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        {selectedIcon ? (
                            <>
                                <selectedIcon.icon className="w-4 h-4" />
                                <span>{selectedIcon.name}</span>
                            </>
                        ) : (
                            <span>Select icon...</span>
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search icon..." />
                    <CommandEmpty>No icon found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {AVAILABLE_ICONS.map((icon) => {
                                const Icon = icon.icon
                                return (
                                    <CommandItem
                                        key={icon.name}
                                        value={icon.name}
                                        onSelect={() => {
                                            onChange(icon.name)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Icon className="w-5 h-5" />
                                            <span>{icon.name}</span>
                                            {value === icon.name && <Check className="w-4 h-4 ml-auto" />}
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

// Hero Section Component
function HeroSection({ data, onChange }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edit the main heading and tagline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="hero-title">Page Title</Label>
                    <Input
                        id="hero-title"
                        value={data.title}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Why Choose Cedar"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="hero-description">Page Description</Label>
                    <Textarea
                        id="hero-description"
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        placeholder="Reliable components for safer elevators..."
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

// Items Section Component
function ItemsSection({ data, onChange, onReload }: any) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newItem, setNewItem] = useState({
        icon: "Star",
        title: "",
        description: "",
        section_title: null as string | null,
        sort_order: data.length + 1,
        status: "active" as "active" | "inactive"
    })
    const [editItem, setEditItem] = useState({
        icon: "",
        title: "",
        description: ""
    })

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.description) {
            toast.error("Title and description are required")
            return
        }

        const result = await createItemAction(newItem)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Item added successfully")
            setIsAdding(false)
            setNewItem({
                icon: "Star",
                title: "",
                description: "",
                section_title: null,
                sort_order: data.length + 2,
                status: "active"
            })
            onReload()
        }
    }

    const handleEdit = (item: WhyChooseItem) => {
        setEditingId(item.id)
        setEditItem({
            icon: item.icon,
            title: item.title,
            description: item.description
        })
    }

    const handleSaveEdit = async (id: string) => {
        if (!editItem.title || !editItem.description) {
            toast.error("Title and description are required")
            return
        }

        const result = await updateItemAction(id, editItem)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Item updated successfully")
            setEditingId(null)
            onReload()
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        const result = await updateItemAction(id, { status: newStatus })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Item ${newStatus === "active" ? "activated" : "deactivated"}`)
            onReload()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return

        const result = await deleteItemAction(id)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Item deleted successfully")
            onReload()
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Excellence Items</CardTitle>
                            <CardDescription>Manage the "Standard of Excellence" grid items</CardDescription>
                        </div>
                        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isAdding && (
                        <Card className="mb-4 border-orange-200 bg-orange-50/50">
                            <CardHeader>
                                <CardTitle className="text-lg">New Item</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Icon</Label>
                                        <IconSelector
                                            value={newItem.icon}
                                            onChange={(value) => setNewItem({ ...newItem, icon: value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={newItem.title}
                                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            placeholder="Quality Assurance"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        placeholder="Every component undergoes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleAddItem} className="bg-orange-600 hover:bg-orange-700 text-black">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Item
                                    </Button>
                                    <Button onClick={() => setIsAdding(false)} variant="outline">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {data.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No excellence items configured</p>
                        ) : (
                            data.map((item: WhyChooseItem) => (
                                <Card key={item.id} className={item.status === "inactive" ? "opacity-60" : ""}>
                                    <CardContent className="p-4">
                                        {editingId === item.id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Icon</Label>
                                                        <IconSelector
                                                            value={editItem.icon}
                                                            onChange={(value) => setEditItem({ ...editItem, icon: value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Title</Label>
                                                        <Input
                                                            value={editItem.title}
                                                            onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                                                            placeholder="Quality Assurance"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        value={editItem.description}
                                                        onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleSaveEdit(item.id)} className="bg-orange-600 hover:bg-orange-700 text-black">
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </Button>
                                                    <Button onClick={() => setEditingId(null)} variant="outline">
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-4">
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-1 cursor-grab" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{item.title}</h3>
                                                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                                            {item.status}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">Icon: {item.icon}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleToggleStatus(item.id, item.status)}
                                                    >
                                                        {item.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Stats Section Component
function StatsSection({ data, onChange }: any) {
    const handleUpdateStat = (id: string, field: string, value: string) => {
        const updatedStats = data.map((stat: any) =>
            stat.id === id ? { ...stat, [field]: value } : stat
        )
        onChange(updatedStats)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stats Section</CardTitle>
                <CardDescription>Edit the statistics displayed (3 stats maximum)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No stats configured</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.map((stat: any) => (
                            <Card key={stat.id}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="space-y-2">
                                        <Label>Number</Label>
                                        <Input
                                            value={stat.number}
                                            onChange={(e) => handleUpdateStat(stat.id, "number", e.target.value)}
                                            placeholder="15+"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={stat.title}
                                            onChange={(e) => handleUpdateStat(stat.id, "title", e.target.value)}
                                            placeholder="Years of Excellence"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subtitle</Label>
                                        <Input
                                            value={stat.subtitle}
                                            onChange={(e) => handleUpdateStat(stat.id, "subtitle", e.target.value)}
                                            placeholder="Proven track record..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// CTA Section Component
function CTASection({ data, onChange }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Call to Action Section</CardTitle>
                <CardDescription>Edit the CTA heading and description (buttons remain fixed)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cta-title">CTA Title</Label>
                    <Input
                        id="cta-title"
                        value={data.title}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Ready to upgrade your infrastructure?"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cta-description">CTA Description</Label>
                    <Textarea
                        id="cta-description"
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        placeholder="Join hundreds of facility managers..."
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
