import { Metadata } from "next"
import { ForgotPasswordTemplate } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Forgot Password - Cedar Elevators",
  description: "Reset your Cedar Elevators account password.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordTemplate />
}
