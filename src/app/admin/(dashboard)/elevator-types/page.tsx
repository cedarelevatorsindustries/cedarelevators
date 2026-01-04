"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, Loader2, GripVertical } from "lucide-react"
import Link from "next/link"
import { useElevatorTypes, useDeleteElevatorType } from "@/hooks/queries/useElevatorTypes"
import { toast } from "sonner"
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

export default function ElevatorTypesListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const { data, isLoading } = useElevatorTypes()
  const deleteMutation = useDeleteElevatorType()

  const elevatorTypes = data?.elevatorTypes || []

  // Filter elevator types
  const filteredTypes = elevatorTypes.filter((type) => {
    if (!searchQuery) return true
    return type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           type.slug.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleDelete = async (id: string) => {
    const result = await deleteMutation.mutateAsync(id)
    
    if (result.success) {
      toast.success('Elevator type deleted successfully')
      setDeleteId(null)
    } else {
      toast.error(result.error || 'Failed to delete elevator type')
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Elevator Types
            </h1>
            <p className="text-gray-600 mt-1">
              Manage elevator type classifications
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
            <Link href="/admin/elevator-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Elevator Type
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search elevator types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elevator Types List */}
        <Card>
          <CardHeader>
            <CardTitle>All Elevator Types ({filteredTypes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTypes.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <GripVertical className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    {searchQuery ? 'No elevator types found' : 'No elevator types yet'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'Create your first elevator type to get started'}
                  </p>
                </div>
                {!searchQuery && (
                  <Button variant="outline" asChild className="mt-4">
                    <Link href="/admin/elevator-types/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Elevator Type
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Slug</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sort Order</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {type.icon && (
                              <span className="text-lg">{type.icon}</span>
                            )}
                            <span className="font-medium text-gray-900">{type.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono text-gray-600">{type.slug}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {type.description || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={type.is_active ? 'default' : 'secondary'}
                            className={type.is_active ? 'bg-green-100 text-green-800' : ''}
                          >
                            {type.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{type.sort_order}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/elevator-types/${type.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/elevator-types/${type.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(type.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Elevator Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this elevator type? This action cannot be undone.
              <br /><br />
              <span className="font-medium text-gray-900">
                Note: Deletion will fail if any products are assigned to this elevator type.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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

