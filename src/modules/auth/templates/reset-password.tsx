import { AuthSplitLayout, ResetPasswordForm } from "../components"

export default function ResetPasswordTemplate() {
  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/password-reset.png"
      illustrationAlt="Reset password illustration"
      overlayTitle="Create a Strong Password"
      overlaySubtitle="Protect your account with enhanced security"
    >
      <ResetPasswordForm />
    </AuthSplitLayout>
  )
}
