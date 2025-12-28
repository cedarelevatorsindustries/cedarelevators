import { StoreSettingsForm } from "@/modules/admin/settings/store-settings-form"

export default function StoreSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Store & Branding</h1>
        <p className="text-lg text-gray-600 mt-2">
          Identity & contact — not marketing
        </p>
      </div>
      <StoreSettingsForm />
    </div>
  )
}