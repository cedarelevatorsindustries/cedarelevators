import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getAuthUser, getUserType } from "@/lib/auth/server"
import { getQuoteById } from "@/lib/actions/quotes"
import QuoteDetailClient from "./quote-detail-client"

export const metadata: Metadata = {
    title: "Quote Details - Cedar Elevators",
    description: "View quote details and status",
}

interface QuoteDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
    const { id } = await params
    const user = await getAuthUser()
    const userType = await getUserType()

    // Redirect guests to login
    if (userType === "guest" || !user) {
        redirect(`/sign-in?redirect_url=/quotes/${id}`)
    }

    // Fetch quote
    const result = await getQuoteById(id)

    if (!result.success || !result.quote) {
        notFound()
    }

    return (
        <QuoteDetailClient
            quote={result.quote}
            userType={userType}
        />
    )
}
