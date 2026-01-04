import Layout from "@/modules/layout"
import Footer from "@/modules/layout/components/desktop/footer"
import FooterLite from "@/modules/layout/components/mobile/footer-lite"
import AboutSectionMobile from "@/modules/layout/components/mobile/about-section-mobile"
import { FloatingActionCard } from "@/components/ui/floating-actions"
import { listCategories } from "@/lib/data"
import { isAuthenticated, getUserType, getCompanyName } from "@/lib/auth/server"
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

      {/* Desktop Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Footer - Hidden on desktop */}
      <div className="md:hidden">
        <AboutSectionMobile />
        <FooterLite />
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionCard
        whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
        showSurvey={false}
      />
    </div>
  )
}

