import { AuthSplitLayout, LoginForm } from "../components"

export default function LoginTemplate() {
  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/login.png"
      illustrationAlt="Login illustration"
      overlayTitle="Welcome Back to Cedar"
      overlaySubtitle="Access your elevator solutions and manage orders seamlessly"
    >
      <LoginForm />
    </AuthSplitLayout>
  )
}

