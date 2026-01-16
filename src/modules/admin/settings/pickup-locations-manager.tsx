"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    getAllPickupLocations,
    createPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
    togglePickupLocationStatus,
    type PickupLocation,
    type PickupLocationData
} from "@/lib/services/pickup-locations"
import { toast } from "sonner"
import { Plus, Edit, Trash2, MapPin, Phone, Clock, LoaderCircle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function PickupLocationsManager() {
    const [locations, setLocations] = useState<PickupLocation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [locationToDelete, setLocationToDelete] = useState<string | null>(null)
    const [formData, setFormData] = useState<PickupLocationData>({
        name: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        phone: "",
        hours: "",
        is_active: true
    })

    useEffect(() => {
        fetchLocations()
    }, [])

    const fetchLocations = async () => {
        setIsLoading(true)
        try {
            const result = await getAllPickupLocations()
            if (result.success && result.data) {
                setLocations(result.data)
            }
        } catch (error) {
            console.error('Error fetching locations:', error)
            toast.error('Failed to load pickup locations')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingId) {
                const result = await updatePickupLocation(editingId, formData)
                if (result.success) {
                    toast.success('Pickup location updated successfully')
                    resetForm()
                    fetchLocations()
                } else {
                    toast.error(result.error || 'Failed to update location')
                }
            } else {
                const result = await createPickupLocation(formData)
                if (result.success) {
                    toast.success('Pickup location created successfully')
                    resetForm()
                    fetchLocations()
                } else {
                    toast.error(result.error || 'Failed to create location')
                }
            }
        } catch (error) {
            console.error('Error saving location:', error)
            toast.error('Failed to save pickup location')
        }
    }

    const handleEdit = (location: PickupLocation) => {
        setFormData({
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state || "",
            postal_code: location.postal_code || "",
            phone: location.phone || "",
            hours: location.hours || "",
            is_active: location.is_active
        })
        setEditingId(location.id)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        setLocationToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!locationToDelete) return

        try {
            const result = await deletePickupLocation(locationToDelete)
            if (result.success) {
                toast.success('Pickup location deleted successfully')
                fetchLocations()
            } else {
                toast.error(result.error || 'Failed to delete location')
            }
        } catch (error) {
            console.error('Error deleting location:', error)
            toast.error('Failed to delete pickup location')
        } finally {
            setDeleteDialogOpen(false)
            setLocationToDelete(null)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const result = await togglePickupLocationStatus(id, !currentStatus)
            if (result.success) {
                toast.success(`Location ${!currentStatus ? 'activated' : 'deactivated'}`)
                fetchLocations()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Failed to update status')
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            address: "",
            city: "",
            state: "",
            postal_code: "",
            phone: "",
            hours: "",
            is_active: true
        })
        setEditingId(null)
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">In-Store Pickup Locations</h3>
                {!isEditing && (
                    <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label className="text-sm font-medium">Store Name *</Label>
                            <Input
                                required
                                placeholder="Cedar Store – Bangalore"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-sm font-medium">Address *</Label>
                            <Input
                                required
                                placeholder="Whitefield, Bangalore"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">City *</Label>
                            <Input
                                required
                                placeholder="Bangalore"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">State</Label>
                            <Input
                                placeholder="Karnataka"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Postal Code</Label>
                            <Input
                                placeholder="560066"
                                value={formData.postal_code}
                                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <Input
                                placeholder="+91-80-1234-5678"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-sm font-medium">Hours</Label>
                            <Input
                                placeholder="Mon-Sat: 9 AM - 7 PM"
                                value={formData.hours}
                                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div className="col-span-2 flex items-center justify-between py-2">
                            <Label className="text-sm font-medium">Active</Label>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                            {editingId ? 'Update Location' : 'Add Location'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {/* Locations List */}
            <div className="space-y-3">
                {locations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No pickup locations added yet</p>
                ) : (
                    locations.map((location) => (
                        <div
                            key={location.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-200 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">{location.name}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${location.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {location.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{location.address}, {location.city}{location.state ? `, ${location.state}` : ''}</span>
                                        </div>
                                        {location.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{location.phone}</span>
                                            </div>
                                        )}
                                        {location.hours && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{location.hours}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleStatus(location.id, location.is_active ?? true)}
                                    >
                                        {location.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(location)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(location.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pickup Location?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this pickup location? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
