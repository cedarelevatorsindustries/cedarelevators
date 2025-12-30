"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { getSystemSettings, updateSystemSettings } from "@/lib/services/settings"
import { Tier1Guard } from "@/components/admin/settings-guards"
import { Save, LoaderCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function SystemSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    maintenance_mode_enabled: false,
    maintenance_message: "We're currently performing system maintenance. We'll be back shortly!",
    bulk_operations_enabled: true,
    advanced_analytics_enabled: false,
    experimental_features_enabled: false,
    debug_logging_enabled: false,
    show_detailed_errors: false,
  })

  useEffect(() => {
    loadProfile()
    loadSettings()
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
      setIsLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const result = await getSystemSettings()
      if (result.success && result.data) {
        setSettingsId(result.data.id)
        setFormData({
          maintenance_mode_enabled: result.data.maintenance_mode_enabled,
          maintenance_message: result.data.maintenance_message,
          bulk_operations_enabled: result.data.bulk_operations_enabled,
          advanced_analytics_enabled: result.data.advanced_analytics_enabled,
          experimental_features_enabled: result.data.experimental_features_enabled,
          debug_logging_enabled: result.data.debug_logging_enabled,
          show_detailed_errors: result.data.show_detailed_errors,
        })
      }
    } catch (error) {
      console.error('Error loading system settings:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!settingsId) {
      toast.error('Settings not loaded')
      return
    }

    setIsSaving(true)

    try {
      const result = await updateSystemSettings(settingsId, formData)

      if (result.success) {
        toast.success('System settings saved successfully')
        loadSettings()
      } else {
        toast.error(result.error || 'Failed to save system settings')
      }
    } catch (error) {
      console.error('Error saving system settings:', error)
      toast.error('Failed to save system settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
    <Tier1Guard userRole={profile.role}>
      <div className="max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">System</h1>
          <p className="text-gray-500 mt-1">
            Feature flags and maintenance mode
          </p>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 text-sm">
            <strong>Caution:</strong> These settings affect the entire platform. Changes should be made carefully.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Maintenance Mode */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
              Maintenance Mode
            </h3>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-900">Enable Maintenance Mode</Label>
                <p className="text-xs text-gray-500">Show maintenance page to all users except admins</p>
              </div>
              <Switch
                checked={formData.maintenance_mode_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, maintenance_mode_enabled: checked }))}
              />
            </div>

            {formData.maintenance_mode_enabled && (
              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <Textarea
                  placeholder="Enter message to show users during maintenance"
                  value={formData.maintenance_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenance_message: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Feature Flags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
              Feature Flags
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Bulk Operations</Label>
                  <p className="text-xs text-gray-500">Enable bulk import/export and batch operations</p>
                </div>
                <Switch
                  checked={formData.bulk_operations_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bulk_operations_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Advanced Analytics</Label>
                  <p className="text-xs text-gray-500">Enable advanced analytics and reporting</p>
                </div>
                <Switch
                  checked={formData.advanced_analytics_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, advanced_analytics_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <Label className="text-sm font-medium text-amber-900">Experimental Features</Label>
                  <p className="text-xs text-amber-700">⚠️ Enable experimental features (may be unstable)</p>
                </div>
                <Switch
                  checked={formData.experimental_features_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, experimental_features_enabled: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Debug Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
              Debug Settings
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Debug Logging</Label>
                  <p className="text-xs text-gray-500">Enable detailed debug logs</p>
                </div>
                <Switch
                  checked={formData.debug_logging_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, debug_logging_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Show Detailed Errors</Label>
                  <p className="text-xs text-gray-500">Display detailed error messages (development only)</p>
                </div>
                <Switch
                  checked={formData.show_detailed_errors}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_detailed_errors: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Tier1Guard>
  )
}
