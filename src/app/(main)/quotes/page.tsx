import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser, getUserType } from "@/lib/auth/server"
import { getQuotes, getQuoteStats } from "@/lib/actions/quotes"
import QuotesPageClient from "./quotes-page-client"

export const metadata: Metadata = {
    title: "My Quotes - Cedar Elevators",
    description: "View and manage your quote requests",
}

export default async function QuotesPage() {
    const user = await getAuthUser()
    const userType = await getUserType()

    // Redirect guests to login
    if (userType === "guest" || !user) {
        redirect("/sign-in?redirect_url=/quotes")
    }

    // Fetch initial data
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

    return (
        <QuotesPageClient
            initialQuotes={quotes}
            initialStats={stats}
            userType={userType}
        />
    )
}
