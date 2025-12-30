import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  approveAdminAction,
  revokeAdminAction,
  getAdminUsersAction,
  inviteAdminUserAction,
  getAdminInvitesAction,
  revokeAdminInviteAction,
  resendAdminInviteAction,
  deleteAdminUserAction
} from '@/lib/actions/admin-auth'
import { AdminRole, AdminProfile } from '@/lib/admin-auth-client'
import { Shield, UserPlus, Mail, Lock, AlertCircle, CircleCheck, XCircle, Clock, Copy, Trash2, Send, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
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
import { AdminInvite } from '@/lib/admin-auth-server'

interface AdminUser {
  id: string
  user_id: string
  role: AdminRole
  is_active: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
  email?: string
  name?: string | null
}

export function AdminUsersSettings() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [pendingInvites, setPendingInvites] = useState<AdminInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'active' | 'pending'>('active')

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff' as AdminRole,
  })
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState('')

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'approve' | 'revoke' | 'delete' | 'revoke_invite' | 'super_admin_warning' | 'resend_invite' | null
    userId?: string
    inviteId?: string
    email?: string
    role?: AdminRole
    newRole?: AdminRole
  }>({
    open: false,
    type: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await Promise.all([loadAdminUsers(), loadPendingInvites()])
    setIsLoading(false)
  }

  const loadAdminUsers = async () => {
    try {
      const result = await getAdminUsersAction()
      if (!result.success || !(result as any).data) {
        console.error('Error loading admin users:', result.error)
        return
      }

      const users = (result as any).data.map((profile: any) => {
        const metadata = profile.raw_user_meta_data || {}
        const fullName = metadata.full_name || metadata.name ||
          (metadata.first_name ? `${metadata.first_name} ${metadata.last_name || ''}` : null)

        return {
          id: profile.id,
          user_id: profile.user_id,
          role: profile.role,
          is_active: profile.is_active,
          approved_by: profile.approved_by,
          approved_at: profile.approved_at,
          created_at: profile.created_at,
          email: profile.email,
          name: fullName
        }
      })
      setAdminUsers(users)
    } catch (error) {
      console.error('Error loading admin users:', error)
    }
  }

  const loadPendingInvites = async () => {
    try {
      const result = await getAdminInvitesAction()
      if (result.success && (result as any).data) {
        setPendingInvites((result as any).data as AdminInvite[])
      } else {
        // Allow failure if unauthorized (e.g. non-super admin)
        if (result.error !== 'Unauthorized to view invites') {
          console.error('Error loading invites:', result.error)
        }
      }
    } catch (error) {
      console.error('Error loading pending invites:', error)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for Super Admin warning
    if (inviteForm.role === 'super_admin') {
      setConfirmDialog({
        open: true,
        type: 'super_admin_warning',
        newRole: inviteForm.role
      })
      return
    }

    await executeInvite()
  }

  const executeInvite = async () => {
    setIsInviting(true)
    setError('')

    try {
      const result = await inviteAdminUserAction(
        inviteForm.email,
        inviteForm.role
      )

      if (!result.success) {
        setError(result.error || 'Failed to send invite')
        toast.error(result.error || 'Failed to send invite')
        return
      }

      toast.success('Invite email sent successfully')

      // Show token link as fallback
      if ((result as any).token) {
        const inviteLink = `${window.location.origin}/admin/invite/${(result as any).token}`
        toast.message('Invite Link Available', {
          description: 'Copy this link if they don\'t receive the email',
          action: {
            label: 'Copy',
            onClick: () => {
              navigator.clipboard.writeText(inviteLink)
              toast.success('Link copied!')
            }
          },
          duration: 8000
        })
      }

      setShowInviteModal(false)
      setInviteForm({ email: '', role: 'staff' })
      loadPendingInvites()
      setViewMode('pending') // Switch to pending view
    } catch (error: any) {
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsInviting(false)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    setConfirmDialog({
      open: true,
      type: 'resend_invite',
      inviteId
    })
  }

  const executeResendInvite = async () => {
    const inviteId = confirmDialog.inviteId
    if (!inviteId) return

    try {
      const result = await resendAdminInviteAction(inviteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to resend invite')
        return
      }

      // Show new token link
      if ((result as any).token) {
        const inviteLink = `${window.location.origin}/admin/invite/${(result as any).token}`
        toast.message('Invite Resent via Email', {
          description: 'Shared link updated. Copy if needed.',
          action: {
            label: 'Copy',
            onClick: () => {
              navigator.clipboard.writeText(inviteLink)
              toast.success('Link copied!')
            }
          },
          duration: 8000
        })
      }

      loadPendingInvites()
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setConfirmDialog({ open: false, type: null })
    }
  }

  const handleRevokeInvite = async (inviteId: string, email: string) => {
    setConfirmDialog({
      open: true,
      type: 'revoke_invite',
      inviteId,
      email
    })
  }

  const executeRevokeInvite = async () => {
    const inviteId = confirmDialog.inviteId
    if (!inviteId) return

    try {
      const result = await revokeAdminInviteAction(inviteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to revoke invite')
        return
      }
      toast.success('Invite revoked successfully')
      loadPendingInvites()
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setConfirmDialog({ open: false, type: null })
    }
  }

  const handleApprove = async (userId: string, userName?: string) => {
    setConfirmDialog({
      open: true,
      type: 'approve',
      userId,
      role: 'admin' as AdminRole, // Just for display fallback
      email: userName // Using userName for email display prop reuse
    })
  }

  const executeApprove = async () => {
    const userId = confirmDialog.userId
    if (!userId) return

    try {
      const result = await approveAdminAction(userId)
      if (!result.success) {
        toast.error(result.error || 'Failed to approve user')
        return
      }
      toast.success('Admin user approved successfully')
      loadAdminUsers()
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setConfirmDialog({ open: false, type: null })
    }
  }

  const handleDelete = async (userId: string, userName?: string) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      userId,
      email: userName
    })
  }

  const executeDelete = async () => {
    const userId = confirmDialog.userId
    if (!userId) return

    try {
      const result = await deleteAdminUserAction(userId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete user')
        return
      }
      toast.success('Admin user deleted successfully')
      loadAdminUsers()
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setConfirmDialog({ open: false, type: null })
    }
  }

  const getRoleBadgeColor = (role: AdminRole | string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'staff':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleLabel = (role: AdminRole | string) => {
    return role.split('_').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage admin access and permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          data-testid="invite-admin-button"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'active'
            ? 'border-orange-600 text-orange-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Active Users ({adminUsers.length})
        </button>
        <button
          onClick={() => setViewMode('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'pending'
            ? 'border-orange-600 text-orange-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Pending Invites ({pendingInvites.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading...</p>
          </div>
        ) : viewMode === 'active' ? (
          /* Active Users List */
          adminUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No admin users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.email || 'Admin User'}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            <CircleCheck className="w-3 h-3 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending Approval
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role !== 'super_admin' && (
                          <div className="flex items-center justify-end gap-2">
                            {!user.is_active && (
                              <button
                                onClick={() => handleApprove(user.user_id, user.email)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Approve User"
                              >
                                <CircleCheck className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.user_id, user.email)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Pending Invites List */
          pendingInvites.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending invites</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingInvites.map((invite) => (
                    <tr key={invite.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(invite.role)}`}>
                          {getRoleLabel(invite.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invite.inviter_email || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResendInvite(invite.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Resend Invite / Copy Link"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.id, invite.email)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Revoke Invite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Admin User</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  required
                  disabled={isInviting}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as AdminRole })}
                disabled={isInviting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex items-start gap-2">
              <Send className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                An invitation email will be sent to the user. They can set their own password upon acceptance.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false)
                  setError('')
                  setInviteForm({ email: '', role: 'staff' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isInviting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'approve' && 'Approve Admin User'}
              {confirmDialog.type === 'delete' && 'Delete Admin User'}
              {confirmDialog.type === 'revoke_invite' && 'Revoke Invitation'}
              {confirmDialog.type === 'resend_invite' && 'Resend Invitation'}
              {confirmDialog.type === 'super_admin_warning' && '⚠️ Super Admin Warning'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'approve' && (
                <>
                  Are you sure you want to approve <strong>{confirmDialog.email || 'this user'}</strong>?
                </>
              )}
              {confirmDialog.type === 'delete' && (
                <>
                  Are you sure you want to permanently delete <strong>{confirmDialog.email || 'this user'}</strong>? This action cannot be undone.
                </>
              )}
              {confirmDialog.type === 'revoke_invite' && (
                <>
                  Are you sure you want to revoke the invitation for <strong>{confirmDialog.email}</strong>? The link will become invalid immediately.
                </>
              )}
              {confirmDialog.type === 'resend_invite' && (
                <>
                  Are you sure you want to regenerate the invite link? The old link will become invalid.
                </>
              )}
              {confirmDialog.type === 'super_admin_warning' && (
                <div className="space-y-3 mt-3">
                  <p className="text-red-800 text-sm">
                    You are about to invite a <strong>Super Admin</strong>. This role has unrestricted access. Are you sure?
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === 'approve') executeApprove()
                else if (confirmDialog.type === 'delete') executeDelete()
                else if (confirmDialog.type === 'revoke_invite') executeRevokeInvite()
                else if (confirmDialog.type === 'resend_invite') executeResendInvite()
                else if (confirmDialog.type === 'super_admin_warning') {
                  setConfirmDialog({ open: false, type: null })
                  executeInvite()
                }
              }}
              className={confirmDialog.type === 'approve' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-red-600 text-white hover:bg-red-700'}
            >
              {confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 