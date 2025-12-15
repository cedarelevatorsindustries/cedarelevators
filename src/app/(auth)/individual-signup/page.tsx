import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { IndividualSignupTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Individual Sign Up - Cedar Elevators",
  description: "Create your individual Cedar Elevators account.",
}

export default async function IndividualSignupPage() {
  const user = await currentUser()

  if (user) {
    redirect("/")
  }

  return <IndividualSignupTemplate />
}
