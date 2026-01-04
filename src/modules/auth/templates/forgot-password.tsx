import { AuthSplitLayout, ForgotPasswordForm } from "../components"

export default function ForgotPasswordTemplate() {
  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/forgot-password.png"
      illustrationAlt="Forgot password illustration"
      overlayTitle="Secure Account Recovery"
      overlaySubtitle="We'll help you get back to your account safely"
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  )
}

