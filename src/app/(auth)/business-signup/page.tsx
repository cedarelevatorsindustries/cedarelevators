import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { BusinessSignupTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Business Sign Up - Cedar Elevators",
  description: "Create your business Cedar Elevators account.",
}

export default async function BusinessSignupPage() {
  const user = await currentUser()

  if (user) {
    redirect("/")
  }

  return <BusinessSignupTemplate />
}

