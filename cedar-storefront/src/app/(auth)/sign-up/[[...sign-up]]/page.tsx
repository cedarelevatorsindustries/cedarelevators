import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sign up - Cedar Elevators",
  description: "Create your Cedar Elevators account.",
}

export default async function SignUpPage() {
  const user = await currentUser()

  if (user) {
    redirect("/")
  }

  // Redirect to choose-type as first step
  redirect("/choose-type")
}
