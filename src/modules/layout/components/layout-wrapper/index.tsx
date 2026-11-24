import Layout from "@/modules/layout"
import Footer from "@/modules/layout/components/desktop/footer"
import { FloatingActionCard } from "@/components/ui/floating-actions"
import { listCategories } from "@/lib/data"
import { isAuthenticated, getUserType, getCompanyName } from "@/lib/auth/server"
import { CartProvider } from "@/contexts/cart-context"
import type { NavbarConfig } from "@/modules/layout/components/desktop/navbar/config"
import type { UserType } from "@/lib/auth/server"

interface LayoutWrapperProps {
  children: React.ReactNode
  customConfig?: Partial<NavbarConfig>
}

export default async function LayoutWrapper({ children, customConfig }: LayoutWrapperProps) {
  // Fetch categories from Medusa backend
  const categories = await listCategories()

  // Check if user is logged in via Clerk
  const isLoggedIn = await isAuthenticated()

  // Get user type (guest, individual, or business)
  const userType = await getUserType()

  // Get company name for business users
  const companyName = await getCompanyName()

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Layout
          categories={categories}
          customConfig={customConfig}
          isLoggedIn={isLoggedIn}
          userType={userType}
          companyName={companyName}
        />
        <main className="flex-1 profile-page-main">
          {children}
        </main>

        {/* Universal Responsive Footer */}
        <Footer isAuthenticated={isLoggedIn} />

        {/* Floating Action Buttons */}
        <FloatingActionCard
          whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
          showSurvey={false}
        />
      </div>
    </CartProvider>
  )
}

