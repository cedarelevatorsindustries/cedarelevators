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

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    redirect("/sign-in")
  }

  // Check if user already has an account type
  const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType
  
  // If user already has account type, redirect to homepage (existing user)
  if (accountType) {
    redirect("/")
  }

  // New user without account type - show the choose-type page
  return <ChooseTypeTemplate />
}

