import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { LoginTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Sign in - Cedar Elevators",
  description: "Sign in to your Cedar Elevators account.",
}

export default async function SignInPage() {
  const user = await currentUser()

  if (user) {
    redirect("/")
  }

  return <LoginTemplate />
}
