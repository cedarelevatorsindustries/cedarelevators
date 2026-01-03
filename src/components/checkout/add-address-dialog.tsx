/**
 * Add Address Dialog
 * Form for adding new shipping/billing addresses
 */

'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { addBusinessAddress, BusinessAddress } from '@/lib/actions/checkout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddAddressDialog({ open, onOpenChange, onSuccess }: AddAddressDialogProps) {
  const { user } = useUser()
  const businessId = user?.publicMetadata?.businessId as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address_type: 'shipping' as 'shipping' | 'billing' | 'both',
    contact_name: '',
    contact_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    gst_number: '',
    is_default: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!businessId) {
      toast.error('Business profile not found')
      return
    }

    setIsSubmitting(true)

    try {
      const address: BusinessAddress = {
        ...formData,
        business_id: businessId,
        country: 'India',
      }

      const result = await addBusinessAddress(address)

      if (!result.success) {
        throw new Error(result.error || 'Failed to add address')
      }

      toast.success('Address added successfully')
      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        address_type: 'shipping',
        contact_name: '',
        contact_phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        gst_number: '',
        is_default: false,
      })
    } catch (error: any) {
      console.error('Add address error:', error)
      toast.error(error.message || 'Failed to add address')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Type */}
          <div>
            <Label htmlFor="address_type">Address Type *</Label>
            <Select
              value={formData.address_type}
              onValueChange={(value) => setFormData({ ...formData, address_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipping">Shipping Only</SelectItem>
                <SelectItem value="billing">Billing Only</SelectItem>
                <SelectItem value="both">Both Shipping & Billing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Name */}
          <div>
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              required
              placeholder="Full name"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <Label htmlFor="contact_phone">Contact Phone *</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              required
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <Label htmlFor="address_line1">Address Line 1 *</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              required
              placeholder="Street address, building name"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Apartment, suite, unit, floor (optional)"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="postal_code">Postal Code *</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              required
              placeholder="6-digit PIN code"
              pattern="[0-9]{6}"
            />
          </div>

          {/* GST Number (optional) */}
          <div>
            <Label htmlFor="gst_number">GST Number (Optional)</Label>
            <Input
              id="gst_number"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              placeholder="15-character GSTIN"
            />
          </div>

          {/* Set as Default */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <Label htmlFor="is_default" className="cursor-pointer">Set as default address</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
