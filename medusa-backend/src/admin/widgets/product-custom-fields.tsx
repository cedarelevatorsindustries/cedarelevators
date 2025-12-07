import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"

const ProductCustomFields = ({ data }: DetailWidgetProps<AdminProduct>) => {
    const [loading, setLoading] = useState(false)

    // Initial values from metadata
    const metadata = data.metadata || {}

    const [brand, setBrand] = useState(metadata.brand as string || "")
    const [leadTime, setLeadTime] = useState(metadata.lead_time as string || "")
    const [moq, setMoq] = useState(metadata.moq as number || 0)

    // Files (storing URLs)
    const [datasheet, setDatasheet] = useState(metadata.datasheet as string || "")
    const [cadFile, setCadFile] = useState(metadata.cad_file as string || "")
    const [certificate, setCertificate] = useState(metadata.certificate as string || "")

    // Specs (JSON)
    const [specs, setSpecs] = useState<Record<string, string>>(
        (metadata.technical_specs as Record<string, string>) || {}
    )

    const handleSave = async () => {
        setLoading(true)
        try {
            // Using fetch with relative path, assuming admin is proxied or same origin.
            // If running separately, you might need to prepend the backend URL (e.g., http://localhost:9000)
            const res = await fetch(`/admin/products/${data.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    metadata: {
                        brand,
                        lead_time: leadTime,
                        moq: Number(moq),
                        datasheet,
                        cad_file: cadFile,
                        certificate,
                        technical_specs: specs
                    }
                })
            })

            if (!res.ok) {
                throw new Error("Failed to update product")
            }

            window.location.reload()
        } catch (e) {
            console.error(e)
            alert("Failed to save")
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (file: File | null, fieldSetter: (url: string) => void) => {
        if (!file) {
            fieldSetter("")
            return
        }

        const formData = new FormData()
        formData.append("files", file)

        try {
            // Using fetch for upload
            const res = await fetch(`/admin/uploads`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error("Upload failed")
            }

            const data = await res.json()
            if (data.files && data.files.length > 0) {
                fieldSetter(data.files[0].url)
            }
        } catch (e) {
            console.error("Upload failed", e)
            alert("Upload failed")
        }
    }

    return (
        <Container className="p-8 flex flex-col gap-6">
            <Heading level="h2">Custom Fields</Heading>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label>Brand</Label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Cedar Industries" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Lead Time</Label>
                    <Input value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="10-15 days" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>MOQ</Label>
                    <Input type="number" value={moq} onChange={(e) => setMoq(Number(e.target.value))} placeholder="5" />
                </div>
            </div>

            <div className="flex flex-col gap-4 border-t pt-4">
                <Heading level="h3">Documents</Heading>

                <div className="grid grid-cols-3 gap-4">
                    <FileUploadField label="Datasheet PDF" value={datasheet} onChange={(f: File | null) => handleFileUpload(f, setDatasheet)} accept=".pdf" />
                    <FileUploadField label="CAD / 3D File" value={cadFile} onChange={(f: File | null) => handleFileUpload(f, setCadFile)} accept=".step,.stp,.iges,.dwg" />
                    <FileUploadField label="Certificate" value={certificate} onChange={(f: File | null) => handleFileUpload(f, setCertificate)} accept=".pdf" />
                </div>
            </div>

            <div className="flex flex-col gap-4 border-t pt-4">
                <Heading level="h3">Technical Specifications</Heading>
                <SpecsEditor specs={specs} onChange={setSpecs} />
            </div>

            <div className="flex justify-end mt-4">
                <Button onClick={handleSave} isLoading={loading}>Save Custom Fields</Button>
            </div>
        </Container>
    )
}

const FileUploadField = ({ label, value, onChange, accept }: { label: string, value: string, onChange: (f: File | null) => void, accept: string }) => {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            {value ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                    <a href={value} target="_blank" rel="noreferrer" className="truncate max-w-[200px]">{value.split('/').pop()}</a>
                    <button onClick={() => onChange(null)} className="text-red-500">x</button>
                </div>
            ) : (
                <Input type="file" accept={accept} onChange={(e) => {
                    if (e.target.files?.[0]) onChange(e.target.files[0])
                }} />
            )}
        </div>
    )
}

interface SpecsEditorProps {
    specs: Record<string, string>
    onChange: (specs: Record<string, string>) => void
}

const SpecsEditor = ({ specs, onChange }: SpecsEditorProps) => {
    const [rows, setRows] = useState<{ key: string, value: string }[]>(
        Object.entries(specs).map(([k, v]) => ({ key: k, value: v as string }))
    )

    useEffect(() => {
        const newSpecs = rows.reduce((acc, { key, value }) => {
            if (key) acc[key] = value
            return acc
        }, {} as Record<string, string>)
        onChange(newSpecs)
    }, [rows])

    const addRow = () => setRows([...rows, { key: "", value: "" }])
    const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index))
    const updateRow = (index: number, field: 'key' | 'value', val: string) => {
        const newRows = [...rows]
        newRows[index][field] = val
        setRows(newRows)
    }

    return (
        <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
                <div key={i} className="flex gap-2">
                    <Input placeholder="Property (e.g. Voltage)" value={row.key} onChange={(e) => updateRow(i, 'key', e.target.value)} />
                    <Input placeholder="Value (e.g. 380V)" value={row.value} onChange={(e) => updateRow(i, 'value', e.target.value)} />
                    <Button variant="danger" onClick={() => removeRow(i)}>X</Button>
                </div>
            ))}
            <Button variant="secondary" onClick={addRow} className="w-fit">+ Add Spec</Button>
        </div>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default ProductCustomFields
