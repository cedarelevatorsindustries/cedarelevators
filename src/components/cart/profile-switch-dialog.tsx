/**
 * Profile Switch Confirmation Dialog
 * Confirms profile switching action
 */

'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProfileType } from '@/types/cart.types'
import { User, Building2 } from 'lucide-react'

interface ProfileSwitchDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  currentProfile: ProfileType
  targetProfile: ProfileType
  currentCartItemCount: number
}

export function ProfileSwitchDialog({
  isOpen,
  onClose,
  onConfirm,
  currentProfile,
  targetProfile,
  currentCartItemCount
}: ProfileSwitchDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error switching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ProfileIcon = targetProfile === 'individual' ? User : Building2
  const profileName = targetProfile === 'individual' ? 'Individual' : 'Business'

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="profile-switch-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ProfileIcon className="w-5 h-5" />
            Switch to {profileName} Profile?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You currently have {currentCartItemCount} item{currentCartItemCount !== 1 ? 's' : ''} in your {currentProfile} cart.
            {' '}Switching profiles will load your {profileName.toLowerCase()} cart.
            <br /><br />
            <strong>Don't worry!</strong> Your current cart will be saved and you can switch back anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Switching...' : `Switch to ${profileName}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
