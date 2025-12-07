import { Metadata } from "next"
import { ResetPasswordTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Reset Password - Cedar Elevators",
  description: "Create a new password for your Cedar Elevators account.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordTemplate />
}
