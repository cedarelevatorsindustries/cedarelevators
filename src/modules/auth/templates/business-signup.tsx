"use client"

import { AuthSplitLayout, BusinessRegisterForm } from "../components"

export default function BusinessSignupTemplate() {
  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/business-accounnt.png"
      illustrationAlt="Business account illustration"
      overlayTitle="Global B2B sourcing with"
      overlaySubtitle="order protection and great savings"
      mobileBackgroundColor="orange"
    >
      <BusinessRegisterForm />
    </AuthSplitLayout>
  )
}

