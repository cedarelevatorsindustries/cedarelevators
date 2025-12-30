"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { LoaderCircle, Shield, Mail, Calendar } from "lucide-react"

export default function AdminProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const result = await getCurrentAdminAction()
            if (result?.profile && result?.user) {
                setProfile(result.profile)
                setUser(result.user)
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setIsLoading(false)
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
        <div className="max-w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                <p className="text-gray-500 mt-1">
                    Manage your admin account
                </p>
            </div>

            <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                            {getInitial(user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {user.email?.split('@')[0] || 'Admin User'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={getRoleBadgeColor(profile.role)}
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                {profile.role.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
                        Account Information
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Permissions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
                        Role & Permissions
                    </h3>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Current Role</span>
                            <Badge
                                variant="outline"
                                className={getRoleBadgeColor(profile.role)}
                            >
                                {profile.role.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <Badge
                                variant="outline"
                                className={profile.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}
                            >
                                {profile.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Member Since</span>
                            <span className="text-sm text-gray-900">
                                {new Date(profile.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Contact a Super Admin to change your role or permissions.
                    </p>
                </div>
            </div>
        </div>
    )
}
