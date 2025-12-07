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

  if (user) {
    redirect("/")
  }

  return <ChooseTypeTemplate />
}
