import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Quote = {
  id: string
  status: string
  customer_id: string
  cart_id: string
  draft_order_id: string
  order_change_id: string
  created_at: string
  updated_at: string
}

type QuoteDetailPageProps = {
  params: {
    id: string
  }
}

const QuoteDetailPage = ({ params }: QuoteDetailPageProps) => {
  const { id } = params
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuote()
    }
  }, [id])

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/admin/quotes/${id}`)
      const data = await res.json()
      setQuote(data.quote)
    } catch (error) {
      console.error("Failed to fetch quote:", error)
      toast.error("Failed to load quote")
    } finally {
      setLoading(false)
    }
  }

  const handleSendQuote = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/admin/quotes/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Failed to send quote")

      toast.success("Quote sent to customer")
      fetchQuote()
    } catch (error) {
      console.error("Failed to send quote:", error)
      toast.error("Failed to send quote")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectQuote = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/admin/quotes/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Failed to reject quote")

      toast.success("Quote rejected")
      fetchQuote()
    } catch (error) {
      console.error("Failed to reject quote:", error)
      toast.error("Failed to reject quote")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_merchant":
        return "orange"
      case "pending_customer":
        return "blue"
      case "accepted":
        return "green"
      case "customer_rejected":
      case "merchant_rejected":
        return "red"
      default:
        return "grey"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <Container className="p-8">
        <Heading level="h1">Quote Details</Heading>
        <p className="text-ui-fg-subtle mt-4">Loading...</p>
      </Container>
    )
  }

  if (!quote) {
    return (
      <Container className="p-8">
        <Heading level="h1">Quote Not Found</Heading>
        <Button onClick={() => window.location.href = "#/quotes"} className="mt-4">
          Back to Quotes
        </Button>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            variant="secondary"
            onClick={() => window.location.href = "#/quotes"}
            className="mb-4"
          >
            ← Back to Quotes
          </Button>
          <Heading level="h1">Quote Details</Heading>
        </div>
        <Badge color={getStatusColor(quote.status)} size="large">
          {formatStatus(quote.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Quote ID</span>
          <span className="font-medium">{quote.id}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Customer ID</span>
          <span className="font-medium">{quote.customer_id || "N/A"}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Cart ID</span>
          <span className="font-medium">{quote.cart_id || "N/A"}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Draft Order ID</span>
          <span className="font-medium">{quote.draft_order_id || "N/A"}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Order Change ID</span>
          <span className="font-medium">{quote.order_change_id || "N/A"}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Created At</span>
          <span className="font-medium">
            {new Date(quote.created_at).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ui-fg-subtle">Updated At</span>
          <span className="font-medium">
            {new Date(quote.updated_at).toLocaleString()}
          </span>
        </div>
      </div>

      {quote.status === "pending_merchant" && (
        <div className="flex gap-4 mt-8 pt-6 border-t">
          <Button
            onClick={handleSendQuote}
            isLoading={actionLoading}
            disabled={actionLoading}
          >
            Send Quote to Customer
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectQuote}
            isLoading={actionLoading}
            disabled={actionLoading}
          >
            Reject Quote
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Quote Details",
})

export default QuoteDetailPage
