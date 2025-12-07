"use client"

import { useRouter } from "next/navigation"
import { AuthSplitLayout, AccountTypeSelector } from "../components"

export default function ChooseTypeTemplate() {
  const router = useRouter()

  const handleSelectType = (type: "individual" | "business") => {
    // Navigate to the appropriate signup page
    router.push(type === "individual" ? "/individual-signup" : "/business-signup")
  }

  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/account-type-selection.png"
      illustrationAlt="Account type selection illustration"
      overlayTitle="Join Cedar Elevators"
      overlaySubtitle="Choose the account type that fits your needs"
      mobileBackgroundColor="orange"
    >
      <AccountTypeSelector onSelectType={handleSelectType} />
    </AuthSplitLayout>
  )
}
