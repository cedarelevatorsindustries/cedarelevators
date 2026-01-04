import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { RegisterTemplate } from "@/modules/auth"

export const metadata: Metadata = {
    title: "Sign up - Cedar Elevators",
    description: "Create your Cedar Elevators account.",
}

export default async function SignUpPage() {
    const user = await currentUser()

    if (user) {
        redirect("/")
    }

    // Render the registration template with account type selection
    return <RegisterTemplate />
}
