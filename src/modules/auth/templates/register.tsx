"use client"

import { useState, useEffect } from "react"
import {
  AuthSplitLayout,
  AccountTypeSelector,
  IndividualRegisterForm,
  BusinessRegisterForm,
} from "../components"

type RegisterView = "account-type" | "individual" | "business"

export default function RegisterTemplate() {
  const [currentView, setCurrentView] = useState<RegisterView>("account-type")

  useEffect(() => {
    console.log("RegisterTemplate mounted, initial view:", currentView)
  }, [])

  useEffect(() => {
    console.log("Current view changed to:", currentView)
  }, [currentView])

  const handleSelectType = (type: "individual" | "business") => {
    console.log("Account type selected:", type)
    setCurrentView(type)
    console.log("Current view updated to:", type)
  }

  const getIllustrationImage = () => {
    switch (currentView) {
      case "account-type":
        return "/images/auth-pannels/account-type-selection.png"
      case "individual":
        return "/images/auth-pannels/individual-account.png"
      case "business":
        return "/images/auth-pannels/business-accounnt.png"
      default:
        return "/images/auth-pannels/account-type-selection.png"
    }
  }

  const getOverlayText = () => {
    switch (currentView) {
      case "account-type":
        return {
          title: "Join Cedar Elevators",
          subtitle: "Choose the account type that fits your needs",
        }
      case "individual":
        return {
          title: "Start Your Journey",
          subtitle: "Get access to premium elevator parts and solutions",
        }
      case "business":
        return {
          title: "Global B2B sourcing with",
          subtitle: "order protection and great savings",
        }
      default:
        return { title: "", subtitle: "" }
    }
  }

  const overlayText = getOverlayText()

  return (
    <AuthSplitLayout
      illustrationImage={getIllustrationImage()}
      illustrationAlt={`${currentView} illustration`}
      overlayTitle={overlayText.title}
      overlaySubtitle={overlayText.subtitle}
      mobileBackgroundColor="orange"
      contentClassName={currentView === "account-type" ? "max-w-4xl" : "max-w-2xl"}
    >
      {currentView === "account-type" && <AccountTypeSelector onSelectType={handleSelectType} />}
      {currentView === "individual" && <IndividualRegisterForm />}
      {currentView === "business" && <BusinessRegisterForm />}
    </AuthSplitLayout>
  )
}

