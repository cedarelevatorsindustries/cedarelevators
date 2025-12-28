import { Metadata } from "next"
import { getAuthUser, getUserType, getBusinessVerificationStatus } from "@/lib/auth/server"
import { getQuotes, getQuoteStats } from "@/lib/actions/quotes"
import { listProducts } from "@/lib/data"
import QuotesPageClient from "./quotes-page-client"

export const metadata: Metadata = {
    title: "Quotes - Cedar Elevators",
    description: "Request quotes and manage your quote requests",
}

export default async function QuotesPage() {
    const user = await getAuthUser()
    const userType = await getUserType()
    const verificationStatus = await getBusinessVerificationStatus()

    // Guest users: Show lead capture form (no redirect)
    if (userType === "guest" || !user) {
        // Fetch products for recommendations
        let products: any[] = []
        try {
            const { response } = await listProducts({
                queryParams: { limit: 10 }
            })
            products = response.products
        } catch (error) {
            console.error("Error fetching products:", error)
        }

        return (
            <QuotesPageClient
                initialQuotes={[]}
                initialStats={{
                    total_quotes: 0,
                    active_quotes: 0,
                    total_value: 0,
                    pending_count: 0,
                    accepted_count: 0
                }}
                userType="guest"
                isVerified={false}
                verificationStatus={null}
                products={products}
            />
        )
    }

    // Logged-in users: Fetch quote data
    const [quotesResult, statsResult] = await Promise.all([
        getQuotes({ status: 'all', date_range: 'all', search: '' }),
        getQuoteStats()
    ])

    const quotes = quotesResult.success ? quotesResult.quotes : []
    const stats = statsResult.success ? statsResult.stats : {
        total_quotes: 0,
        active_quotes: 0,
        total_value: 0,
        pending_count: 0,
        accepted_count: 0
    }

    // Fetch products for recommendations
    let products: any[] = []
    try {
        const { response } = await listProducts({
            queryParams: { limit: 10 }
        })
        products = response.products
    } catch (error) {
        console.error("Error fetching products:", error)
    }

    return (
        <QuotesPageClient
            initialQuotes={quotes}
            initialStats={stats}
            userType={userType}
            isVerified={verificationStatus.isVerified}
            verificationStatus={verificationStatus.status}
            products={products}
        />
    )
}
