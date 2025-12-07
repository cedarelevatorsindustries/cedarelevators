import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Label, Button, Input, toast } from "@medusajs/ui"
import { useState } from "react"
import { DetailWidgetProps, AdminProductCategory } from "@medusajs/framework/types"
import * as LucideIcons from "lucide-react"

const CategoryCustomFields = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
    const [loading, setLoading] = useState(false)
    const [iconName, setIconName] = useState((data.metadata?.category_icon as string) || "")
    const [customIconUrl, setCustomIconUrl] = useState((data.metadata?.category_image as string) || "")
    const [search, setSearch] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    // Get all icon keys
    const allIcons = Object.keys(LucideIcons).filter(key => key !== "icons" && key !== "createLucideIcon" && key !== "default")

    // Filter based on search
    const filteredIcons = allIcons.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 50)

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/admin/product-categories/${data.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    metadata: {
                        category_icon: iconName,
                        category_image: customIconUrl
                    }
                })
            })

            if (!res.ok) {
                throw new Error("Failed to update category")
            }

            window.location.reload()
        } catch (e) {
            console.error(e)
            toast.error("Failed to save category")
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (file: File | null) => {
        if (!file) {
            setCustomIconUrl("")
            return
        }

        const formData = new FormData()
        formData.append("files", file)

        try {
            const res = await fetch(`/admin/uploads`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error("Upload failed")
            }

            const data = await res.json()
            if (data.files && data.files.length > 0) {
                setCustomIconUrl(data.files[0].url)
            }
        } catch (e) {
            console.error("Upload failed", e)
            toast.error("Upload failed")
        }
    }

    const SelectedIcon = iconName && (LucideIcons as any)[iconName] ? (LucideIcons as any)[iconName] : null

    return (
        <Container className="p-8 flex flex-col gap-6">
            <Heading level="h2">Category Design</Heading>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Option 1: Standard Icon */}
                <div className="flex flex-col gap-2 relative">
                    <Label>Option A: Standard Icon (Lucide)</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 relative">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search icon (e.g. 'box')..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setIsOpen(true)
                                    }}
                                    onFocus={() => setIsOpen(true)}
                                    className="w-full"
                                />
                            </div>

                            {isOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[200px] overflow-y-auto bg-ui-bg-base border border-ui-border-base rounded-md shadow-lg p-2 grid grid-cols-4 gap-2">
                                    {filteredIcons.map(name => {
                                        const Icon = (LucideIcons as any)[name]
                                        return (
                                            <button
                                                key={name}
                                                className={`flex flex-col items-center justify-center p-2 rounded hover:bg-ui-bg-subtle-hover transition-colors ${iconName === name ? 'bg-ui-bg-subtle border border-ui-border-strong' : ''}`}
                                                onClick={() => {
                                                    setIconName(name)
                                                    setIsOpen(false)
                                                    setSearch(name)
                                                }}
                                            >
                                                <Icon size={20} className="mb-1" />
                                                <span className="text-[10px] truncate w-full text-center text-ui-fg-subtle">{name}</span>
                                            </button>
                                        )
                                    })}
                                    {filteredIcons.length === 0 && (
                                        <div className="col-span-4 text-center p-2 text-sm text-ui-fg-muted">No icons found</div>
                                    )}
                                </div>
                            )}

                            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
                        </div>

                        <div className="flex flex-col items-center justify-center w-12 h-12 border rounded bg-ui-bg-subtle shrink-0">
                            {SelectedIcon ? <SelectedIcon size={24} /> : <span className="text-xs text-ui-fg-muted">-</span>}
                        </div>
                    </div>
                </div>

                {/* Option 2: Custom Upload */}
                <div className="flex flex-col gap-2">
                    <Label>Option B: Upload Custom Icon (SVG/PNG)</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <Input
                                type="file"
                                accept=".svg,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-ui-fg-subtle mt-1">
                                Recommended: SVG or transparent PNG (64x64px).
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 border rounded bg-ui-bg-subtle shrink-0 overflow-hidden">
                            {customIconUrl ? (
                                <img src={customIconUrl} alt="Custom" className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="text-xs text-ui-fg-muted">-</span>
                            )}
                        </div>
                        {customIconUrl && (
                            <Button variant="transparent" className="text-red-500" onClick={() => setCustomIconUrl("")}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button onClick={handleSave} isLoading={loading}>Save Category Design</Button>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product_category.details.after",
})

export default CategoryCustomFields
