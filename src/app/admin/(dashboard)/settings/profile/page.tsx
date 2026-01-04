"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentAdminAction, updateAdminProfileAction, uploadAdminAvatarAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { LoaderCircle, Shield, Mail, Calendar, Upload, Camera } from "lucide-react"
import { toast } from "sonner"

export default function AdminProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [user, setUser] = useState<any>(null)
    const [displayName, setDisplayName] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const result = await getCurrentAdminAction()
            if (result?.profile && result?.user) {
                setProfile(result.profile)
                setUser(result.user)
                setDisplayName(result.profile.display_name || "")
            }
        } catch (error) {
            console.error('Error loading profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateAdminProfileAction({ display_name: displayName })
            if (result.success) {
                toast.success('Profile updated')
                loadProfile() // Reload to refresh state
            } else {
                toast.error(result.error || 'Failed to update profile')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const toastId = toast.loading('Uploading avatar...')

        try {
            const result = await uploadAdminAvatarAction(formData)
            if (result.success && result.publicUrl) {
                // Update profile with new avatar URL
                await updateAdminProfileAction({ avatar_url: result.publicUrl })
                toast.success('Avatar updated', { id: toastId })
                loadProfile()
            } else {
                toast.error(result.error || 'Upload failed', { id: toastId })
            }
        } catch (error) {
            toast.error('Upload failed', { id: toastId })
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'admin':
                return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'manager':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getInitial = (email: string) => {
        return email?.charAt(0)?.toUpperCase() || 'A'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (!profile || !user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Unable to load profile</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                <p className="text-gray-500 mt-1">
                    Manage your admin account settings
                </p>
            </div>

            <div className="space-y-8">
                {/* Profile Header & Avatar */}
                <div className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                <AvatarImage src={profile.avatar_url || ""} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 text-3xl">
                                    {getInitial(user.email)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-sm"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">Display Name</Label>
                            <div className="mt-1 flex gap-3">
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="max-w-md"
                                />
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isSaving ? "Saving..." : "Save Name"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={getRoleBadgeColor(profile.role)}
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                {profile.role.replace('_', ' ')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={profile.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}
                            >
                                {profile.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Account Details */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Account Details</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email Address
                                </span>
                                <p className="font-medium text-gray-900">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Member Since
                                </span>
                                <p className="font-medium text-gray-900">
                                    {new Date(profile.created_at).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

