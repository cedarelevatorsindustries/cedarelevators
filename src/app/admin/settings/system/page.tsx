"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { SettingsService } from "@/lib/services/settings"
import { Tier1Guard } from "@/components/admin/settings-guards"
import { Save, Settings as SettingsIcon, LoaderCircle, AlertTriangle, Flag, Bug } from "lucide-react"
import { toast } from "sonner"

export default function SystemSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  
  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    bulk_operations_enabled: true,
    advanced_analytics_enabled: false,
    experimental_features_enabled: false,
  })

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: "We're currently performing system maintenance. We'll be back shortly!",
  })

  // Debug Settings
  const [debugSettings, setDebugSettings] = useState({
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
      const result = await SettingsService.getSystemSettings()
      if (result.success && result.data) {
        setSettingsId(result.data.id)
        setFeatureFlags({
          bulk_operations_enabled: result.data.bulk_operations_enabled,
          advanced_analytics_enabled: result.data.advanced_analytics_enabled,
          experimental_features_enabled: result.data.experimental_features_enabled,
        })
        setMaintenanceMode({
          enabled: result.data.maintenance_mode_enabled,
          message: result.data.maintenance_message,
        })
        setDebugSettings({
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
      const result = await SettingsService.updateSystemSettings(settingsId, {
        ...featureFlags,
        maintenance_mode_enabled: maintenanceMode.enabled,
        maintenance_message: maintenanceMode.message,
        ...debugSettings,
      })
      
      if (result.success) {
        toast.success('System settings updated successfully')
        loadSettings()
      } else {
        toast.error(result.error || 'Failed to update system settings')
      }
    } catch (error) {
      console.error('Error saving system settings:', error)
      toast.error('Failed to update system settings')
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">System Settings</h1>
          <p className="text-lg text-gray-600 mt-2">
            Feature flags, maintenance mode, and debug settings
          </p>
        </div>

        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>Caution:</strong> These settings affect the entire platform. Changes should be made carefully and tested in a staging environment first.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Feature Flags */}
          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                <Flag className="h-5 w-5" />
                <span>Feature Flags</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enable or disable experimental features and modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">Bulk Operations</Label>
                  <p className="text-sm text-gray-600">
                    Enable bulk import/export and batch operations
                  </p>
                </div>
                <Switch 
                  checked={featureFlags.bulk_operations_enabled}
                  onCheckedChange={(checked) => setFeatureFlags(prev => ({ ...prev, bulk_operations_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">Advanced Analytics</Label>
                  <p className="text-sm text-gray-600">
                    Enable advanced analytics and reporting features
                  </p>
                </div>
                <Switch 
                  checked={featureFlags.advanced_analytics_enabled}
                  onCheckedChange={(checked) => setFeatureFlags(prev => ({ ...prev, advanced_analytics_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-amber-900">Experimental Features</Label>
                  <p className="text-sm text-amber-700">
                    ⚠️ Enable experimental features (may be unstable)
                  </p>
                </div>
                <Switch 
                  checked={featureFlags.experimental_features_enabled}
                  onCheckedChange={(checked) => setFeatureFlags(prev => ({ ...prev, experimental_features_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                <SettingsIcon className="h-5 w-5" />
                <span>Maintenance Mode</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Put the platform in maintenance mode for updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">Enable Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">
                    Show maintenance page to all users except admins
                  </p>
                </div>
                <Switch 
                  checked={maintenanceMode.enabled}
                  onCheckedChange={(checked) => setMaintenanceMode(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              {maintenanceMode.enabled && (
                <div className="space-y-2 p-4 rounded-xl bg-white/60 border border-gray-200/50">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    placeholder="Enter message to show users during maintenance"
                    value={maintenanceMode.message}
                    onChange={(e) => setMaintenanceMode(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">This message will be displayed to users during maintenance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Settings */}
          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50 hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                <Bug className="h-5 w-5" />
                <span>Debug Settings</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure debugging and error logging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">Debug Logging</Label>
                  <p className="text-sm text-gray-600">
                    Enable detailed debug logs in console and files
                  </p>
                </div>
                <Switch 
                  checked={debugSettings.debug_logging_enabled}
                  onCheckedChange={(checked) => setDebugSettings(prev => ({ ...prev, debug_logging_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-gray-200/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">Show Detailed Errors</Label>
                  <p className="text-sm text-gray-600">
                    Display detailed error messages (development only)
                  </p>
                </div>
                <Switch 
                  checked={debugSettings.show_detailed_errors}
                  onCheckedChange={(checked) => setDebugSettings(prev => ({ ...prev, show_detailed_errors: checked }))}
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <strong>Security Warning:</strong> Never enable detailed errors in production as they may expose sensitive information.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
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
