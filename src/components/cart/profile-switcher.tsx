/**
 * Profile Switcher Component
 * Allows switching between individual and business carts
 */

'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/cart-context'
import { ProfileType } from '@/types/cart.types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Building2 } from 'lucide-react'

interface ProfileSwitcherProps {
  currentProfile: ProfileType
  hasBusinessProfile: boolean
  businessId?: string
}

export function ProfileSwitcher({ 
  currentProfile, 
  hasBusinessProfile, 
  businessId 
}: ProfileSwitcherProps) {
  const { switchProfile, summary } = useCart()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [targetProfile, setTargetProfile] = useState<ProfileType>('individual')
  const [isSwitching, setIsSwitching] = useState(false)

  if (!hasBusinessProfile) return null

  const handleSwitchRequest = (newProfile: ProfileType) => {
    if (newProfile === currentProfile) return

    setTargetProfile(newProfile)
    
    // Show confirmation if cart has items
    if (summary.itemCount > 0) {
      setShowConfirmation(true)
    } else {
      performSwitch(newProfile)
    }
  }

  const performSwitch = async (newProfile: ProfileType) => {
    setIsSwitching(true)
    await switchProfile(newProfile, newProfile === 'business' ? businessId : undefined)
    setIsSwitching(false)
    setShowConfirmation(false)
  }

  return (
    <>
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Shopping as</p>
            <p className="font-medium text-gray-900">
              {currentProfile === 'individual' ? (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Individual
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Business
                </span>
              )}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSwitchRequest(currentProfile === 'individual' ? 'business' : 'individual')}
            disabled={isSwitching}
            data-testid="switch-profile-btn"
          >
            Switch to {currentProfile === 'individual' ? 'Business' : 'Individual'}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Cart Profile?</DialogTitle>
            <DialogDescription>
              You have {summary.itemCount} item{summary.itemCount > 1 ? 's' : ''} in your current {currentProfile} cart.
              <br /><br />
              Switching to {targetProfile} will load a different cart. Your current cart items will be preserved and available when you switch back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSwitching}
            >
              Cancel
            </Button>
            <Button
              onClick={() => performSwitch(targetProfile)}
              disabled={isSwitching}
              data-testid="confirm-switch-btn"
            >
              {isSwitching ? 'Switching...' : 'Switch Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
