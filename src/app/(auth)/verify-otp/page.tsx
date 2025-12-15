import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AuthSplitLayout } from "@modules/auth/components"
import EmailOTPForm from "@modules/auth/components/forms/email-otp-form"

export const metadata: Metadata = {
  title: "Verify Email - Cedar Elevators",
  description: "Verify your email address to complete registration.",
}

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyOTPPage({ searchParams }: Props) {
  const user = await currentUser()

  // If already logged in, redirect to home
  if (user) {
    redirect("/")
  }

  // If no email in query params, redirect to sign-up
  const params = await searchParams
  const email = params.email
  if (!email) {
    redirect("/sign-up")
  }

  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/otp-verification.png"
      illustrationAlt="Email verification illustration"
      overlayTitle="Almost There!"
      overlaySubtitle="Verify your email to get started with Cedar Elevators"
    >
      <EmailOTPForm email={decodeURIComponent(email)} />
    </AuthSplitLayout>
  )
}
