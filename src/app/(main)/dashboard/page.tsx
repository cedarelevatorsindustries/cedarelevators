import { Metadata } from "next"
import { getAuthUser, getUserType, getCompanyName } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { IndividualDashboard, BusinessDashboard } from "@/modules/dashboard/templates"

export const metadata: Metadata = {
  title: "Dashboard - Cedar Elevators",
  description: "Your Cedar Elevators dashboard.",
}

export default async function DashboardPage() {
  const user = await getAuthUser()
  
  if (!user) {
    redirect("/sign-in")
  }

  const userType = await getUserType()
  const companyName = await getCompanyName()

  if (userType === "business") {
    return <BusinessDashboard user={user} companyName={companyName} />
  }

  return <IndividualDashboard user={user} />
}

