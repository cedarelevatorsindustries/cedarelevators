import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ChooseTypeTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Choose Account Type - Cedar Elevators",
  description: "Select whether you're signing up as an individual or business.",
}

export default async function ChooseTypePage() {
  const user = await currentUser()

  // If user is authenticated and has account type, redirect to homepage
  if (user) {
    const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType

    if (accountType) {
      redirect("/")
    }
  }

  // User is authenticated but doesn't have account type - show selector
  // Or user just completed OTP verification - show selector

  // Render the choose type template (it will handle authentication checks)
  return <ChooseTypeTemplate />
}
