"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { Tier2Guard } from "@/components/admin/settings-guards"
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from "@/lib/services/cms"
import { CMSPolicy, PolicyType } from "@/lib/types/cms"
import { toast } from "sonner"
import { Save, LoaderCircle, Plus, Edit, Trash2, FileText } from "lucide-react"

const POLICY_TYPES = [
    { value: 'privacy_policy' as PolicyType, label: 'Privacy Policy' },
    { value: 'terms_of_service' as PolicyType, label: 'Terms of Service' },
    { value: 'return_policy' as PolicyType, label: 'Return & Refund Policy' },
    { value: 'shipping_policy' as PolicyType, label: 'Shipping Policy' }
]

export default function PoliciesPage() {
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [policies, setPolicies] = useState<CMSPolicy[]>([])
    const [editingPolicy, setEditingPolicy] = useState<CMSPolicy | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        policy_type: 'privacy_policy' as PolicyType,
        title: '',
        content: '',
        status: 'draft' as 'draft' | 'published'
    })

    useEffect(() => {
        loadProfile()
        loadPolicies()
    }, [])

    const loadProfile = async () => {
        try {
            const result = await getCurrentAdminAction()
            if (result?.profile) {
                setProfile(result.profile)
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const loadPolicies = async () => {
        try {
            const result = await getPolicies()
            if (result.success && result.data) {
                setPolicies(result.data)
            }
        } catch (error) {
            console.error('Error loading policies:', error)
        }
    }

    const handleEdit = (policy: CMSPolicy) => {
        setEditingPolicy(policy)
        setFormData({
            policy_type: policy.policy_type,
            title: policy.title,
            content: policy.content,
            status: policy.status
        })
        setIsCreating(false)
    }

    const handleCreate = () => {
        setEditingPolicy(null)
        setFormData({
            policy_type: 'privacy_policy',
            title: '',
            content: '',
            status: 'draft'
        })
        setIsCreating(true)
    }

    const handleCancel = () => {
        setEditingPolicy(null)
        setIsCreating(false)
        setFormData({
            policy_type: 'privacy_policy',
            title: '',
            content: '',
            status: 'draft'
        })
    }

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)
        try {
            if (editingPolicy) {
                const result = await updatePolicy(editingPolicy.id, {
                    title: formData.title,
                    content: formData.content,
                    status: formData.status
                })
                if (result.success) {
                    toast.success('Policy updated successfully')
                    await loadPolicies()
                    handleCancel()
                } else {
                    toast.error(result.error || 'Failed to update policy')
                }
            } else {
                const result = await createPolicy({
                    policy_type: formData.policy_type,
                    title: formData.title,
                    content: formData.content,
                    status: formData.status
                })
                if (result.success) {
                    toast.success('Policy created successfully')
                    await loadPolicies()
                    handleCancel()
                } else {
                    toast.error(result.error || 'Failed to create policy')
                }
            }
        } catch (error) {
            console.error('Error saving policy:', error)
            toast.error('Failed to save policy')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this policy?')) return

        setIsLoading(true)
        try {
            const result = await deletePolicy(id)
            if (result.success) {
                toast.success('Policy deleted successfully')
                await loadPolicies()
            } else {
                toast.error(result.error || 'Failed to delete policy')
            }
        } catch (error) {
            console.error('Error deleting policy:', error)
            toast.error('Failed to delete policy')
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Unable to load user profile</p>
            </div>
        )
    }

    return (
        <Tier2Guard userRole={profile.role}>
            <div className="max-w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Policies</h1>
                    <p className="text-gray-500 mt-1">
                        Manage store policies and legal documents
                    </p>
                </div>

                {!isCreating && !editingPolicy ? (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Button
                                onClick={handleCreate}
                                className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-6 text-base"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create Policy
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {POLICY_TYPES.map((policyType) => {
                                const existingPolicy = policies.find(p => p.policy_type === policyType.value)

                                return (
                                    <Card key={policyType.value} className="border border-gray-200 hover:border-orange-200 transition-colors">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-orange-50 rounded-lg">
                                                        <FileText className="h-6 w-6 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                                            {policyType.label}
                                                        </CardTitle>
                                                        {existingPolicy && (
                                                            <CardDescription className="text-sm text-gray-500 mt-1">
                                                                Updated {new Date(existingPolicy.updated_at).toLocaleDateString()}
                                                            </CardDescription>
                                                        )}
                                                    </div>
                                                </div>
                                                {existingPolicy && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${existingPolicy.status === 'published'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {existingPolicy.status === 'published' ? 'Published' : 'Draft'}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {existingPolicy ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(existingPolicy)}
                                                        className="flex-1"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(existingPolicy.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, policy_type: policyType.value }))
                                                        handleCreate()
                                                    }}
                                                    className="w-full"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                                {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                            </h3>

                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <Label className="text-base font-medium">Policy Type</Label>
                                    <Select
                                        value={formData.policy_type}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, policy_type: value as PolicyType }))}
                                        disabled={!!editingPolicy}
                                    >
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Select policy type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POLICY_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-medium">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Privacy Policy"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="h-12 text-base"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="content" className="text-base font-medium">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Enter policy content..."
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        rows={12}
                                        className="text-base"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Write your policy content in plain text or markdown format
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl">
                                    <div>
                                        <Label className="text-base font-medium text-gray-900">Published</Label>
                                        <p className="text-sm text-gray-500 mt-1">Make this policy visible to customers</p>
                                    </div>
                                    <Switch
                                        checked={formData.status === 'published'}
                                        onCheckedChange={(checked) => setFormData(prev => ({
                                            ...prev,
                                            status: checked ? 'published' : 'draft'
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex gap-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-6 text-base"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {isLoading ? "Saving..." : "Save Policy"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="h-12 px-6 text-base"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Tier2Guard>
    )
}
