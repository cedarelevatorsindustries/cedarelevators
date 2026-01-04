"use client"

import { AuthSplitLayout, IndividualRegisterForm } from "../components"

export default function IndividualSignupTemplate() {
  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/individual-account.png"
      illustrationAlt="Individual account illustration"
      overlayTitle="Start Your Journey"
      overlaySubtitle="Get access to premium elevator parts and solutions"
      mobileBackgroundColor="orange"
    >
      <IndividualRegisterForm />
    </AuthSplitLayout>
  )
}

