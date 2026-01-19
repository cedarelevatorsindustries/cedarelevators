"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save, Eye, Edit, LoaderCircle, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
    getPoliciesAction,
    upsertPolicyAction,
    updatePolicyStatusAction,
    type Policy,
    type PolicyType,
    type PolicySection,
    type SectionContentType
} from "@/lib/actions/policies-cms"

const POLICY_LABELS: Record<PolicyType, string> = {
    'privacy': 'Privacy Policy',
    'terms': 'Terms & Conditions',
    'return': 'Return Policy',
    'shipping': 'Shipping Policy'
}

const POLICY_PATHS: Record<PolicyType, string> = {
    'privacy': '/privacy',
    'terms': '/terms',
    'return': '/return-policy',
    'shipping': '/shipping-policy'
}

export default function PoliciesCMSPage() {
    const [policies, setPolicies] = useState<Policy[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form states
    const [title, setTitle] = useState("")
    const [lastUpdated, setLastUpdated] = useState("")
    const [sections, setSections] = useState<PolicySection[]>([])

    useEffect(() => {
        loadPolicies()
    }, [])

    async function loadPolicies() {
        setIsLoading(true)
        const result = await getPoliciesAction()

        if (result.data) {
            setPolicies(result.data)
        } else if (result.error) {
            toast.error(result.error)
        }

        setIsLoading(false)
    }

    function handleEdit(policy: Policy) {
        setEditingPolicy(policy)
        setTitle(policy.title)
        setLastUpdated(policy.last_updated)
        setSections(policy.content && policy.content.length > 0 ? policy.content : [
            { id: crypto.randomUUID(), title: '', content: '', content_type: 'paragraph', order: 0 }
        ])
    }

    function addSection(contentType: SectionContentType) {
        const newSection: PolicySection = {
            id: crypto.randomUUID(),
            title: '',
            content: '',
            content_type: contentType,
            order: sections.length
        }

        if (contentType === 'bullet' || contentType === 'numbered') {
            newSection.items = ['']
        } else if (contentType === 'table') {
            newSection.table_data = { headers: [''], rows: [['']] }
        }

        setSections([...sections, newSection])
    }

    function updateSection(id: string, updates: Partial<PolicySection>) {
        setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    function addListItem(sectionId: string) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.items) {
                return { ...s, items: [...s.items, ''] }
            }
            return s
        }))
    }

    function updateListItem(sectionId: string, index: number, value: string) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.items) {
                const newItems = [...s.items]
                newItems[index] = value
                return { ...s, items: newItems }
            }
            return s
        }))
    }

    function removeListItem(sectionId: string, index: number) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.items) {
                return { ...s, items: s.items.filter((_, i) => i !== index) }
            }
            return s
        }))
    }

    function addTableRow(sectionId: string) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.table_data) {
                const newRow = new Array(s.table_data.headers.length).fill('')
                return {
                    ...s,
                    table_data: {
                        ...s.table_data,
                        rows: [...s.table_data.rows, newRow]
                    }
                }
            }
            return s
        }))
    }

    function addTableColumn(sectionId: string) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.table_data) {
                return {
                    ...s,
                    table_data: {
                        headers: [...s.table_data.headers, ''],
                        rows: s.table_data.rows.map(row => [...row, ''])
                    }
                }
            }
            return s
        }))
    }

    function updateTableCell(sectionId: string, rowIndex: number, colIndex: number, value: string) {
        setSections(sections.map(s => {
            if (s.id === sectionId && s.table_data) {
                if (rowIndex === -1) {
                    // Update header
                    const newHeaders = [...s.table_data.headers]
                    newHeaders[colIndex] = value
                    return { ...s, table_data: { ...s.table_data, headers: newHeaders } }
                } else {
                    // Update cell
                    const newRows = s.table_data.rows.map((row, idx) => {
                        if (idx === rowIndex) {
                            const newRow = [...row]
                            newRow[colIndex] = value
                            return newRow
                        }
                        return row
                    })
                    return { ...s, table_data: { ...s.table_data, rows: newRows } }
                }
            }
            return s
        }))
    }

    function removeSection(id: string) {
        setSections(sections.filter(s => s.id !== id))
    }

    async function handleSave() {
        if (!editingPolicy) return

        setIsSaving(true)

        const result = await upsertPolicyAction(editingPolicy.policy_type, {
            title,
            content: sections,
            last_updated: lastUpdated
        })

        setIsSaving(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Policy saved successfully!')
            setEditingPolicy(null)
            loadPolicies()
        }
    }

    async function toggleStatus(policyType: PolicyType, currentStatus: string) {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published'

        const result = await updatePolicyStatusAction(policyType, newStatus)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Policy ${newStatus}!`)
            loadPolicies()
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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
                <p className="text-sm text-gray-600">Manage content for all policy pages</p>
            </div>

            {/* Policies List */}
            <div className="grid gap-4">
                {policies.map((policy) => (
                    <Card key={policy.id}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {POLICY_LABELS[policy.policy_type]}
                                        </h3>
                                        <Badge
                                            variant={policy.status === 'published' ? 'default' : 'secondary'}
                                            className={policy.status === 'published' ? 'bg-green-600' : ''}
                                        >
                                            {policy.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Last updated: {new Date(policy.last_updated).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleStatus(policy.policy_type, policy.status)}
                                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                    >
                                        {policy.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </Button>
                                    <Link href={POLICY_PATHS[policy.policy_type]} target="_blank">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        onClick={() => handleEdit(policy)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Edit {editingPolicy && POLICY_LABELS[editingPolicy.policy_type]}
                        </DialogTitle>
                        <DialogDescription>
                            Update the policy content and sections
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Policy Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Privacy Policy"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <Input
                                    type="date"
                                    value={lastUpdated}
                                    onChange={(e) => setLastUpdated(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Content Sections</Label>
                                <div className="flex gap-2">
                                    <Select onValueChange={(value) => addSection(value as SectionContentType)}>
                                        <SelectTrigger className="w-[180px] border-orange-600 text-orange-600">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                <SelectValue placeholder="Add Section" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paragraph">Paragraph</SelectItem>
                                            <SelectItem value="bullet">Bullet Points</SelectItem>
                                            <SelectItem value="numbered">Numbered List</SelectItem>
                                            <SelectItem value="table">Table</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {sections.map((section, index) => (
                                <Card key={section.id} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-orange-600">Section {index + 1}</Label>
                                                <Badge variant="outline">{section.content_type}</Badge>
                                            </div>
                                            {sections.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSection(section.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Section Title</Label>
                                            <Input
                                                value={section.title}
                                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                                placeholder="Introduction"
                                            />
                                        </div>

                                        {/* Paragraph */}
                                        {section.content_type === 'paragraph' && (
                                            <div className="space-y-2">
                                                <Label>Content</Label>
                                                <Textarea
                                                    value={section.content}
                                                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                                    placeholder="Enter section content..."
                                                    rows={4}
                                                />
                                            </div>
                                        )}

                                        {/* Bullet/Numbered List */}
                                        {(section.content_type === 'bullet' || section.content_type === 'numbered') && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>List Items</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addListItem(section.id)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Item
                                                    </Button>
                                                </div>
                                                {section.items?.map((item, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input
                                                            value={item}
                                                            onChange={(e) => updateListItem(section.id, idx, e.target.value)}
                                                            placeholder={`Item ${idx + 1}`}
                                                        />
                                                        {section.items && section.items.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeListItem(section.id, idx)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Table */}
                                        {section.content_type === 'table' && section.table_data && (
                                            <div className="space-y-2">
                                                <div className="flex gap-2 mb-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addTableRow(section.id)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Row
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addTableColumn(section.id)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Column
                                                    </Button>
                                                </div>
                                                <div className="overflow-x-auto border rounded">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {section.table_data.headers.map((header, colIdx) => (
                                                                    <th key={colIdx} className="p-2">
                                                                        <Input
                                                                            value={header}
                                                                            onChange={(e) => updateTableCell(section.id, -1, colIdx, e.target.value)}
                                                                            placeholder={`Header ${colIdx + 1}`}
                                                                            className="text-center font-semibold"
                                                                        />
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.table_data.rows.map((row, rowIdx) => (
                                                                <tr key={rowIdx}>
                                                                    {row.map((cell, colIdx) => (
                                                                        <td key={colIdx} className="p-2">
                                                                            <Input
                                                                                value={cell}
                                                                                onChange={(e) => updateTableCell(section.id, rowIdx, colIdx, e.target.value)}
                                                                                placeholder={`Cell ${rowIdx + 1},${colIdx + 1}`}
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setEditingPolicy(null)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {isSaving ? (
                                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Policy
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
