import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Quote = {
  id: string
  status: string
  customer_id: string
  cart_id: string
  created_at: string
  updated_at: string
}

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/admin/quotes")
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch (error) {
      console.error("Failed to fetch quotes:", error)
    } finally {
      setLoading(false)
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
        <Heading level="h1">Quotes</Heading>
        <p className="text-ui-fg-subtle mt-4">Loading...</p>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Heading level="h1">Quotes</Heading>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-ui-fg-subtle">
          <p>No quotes found</p>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Customer ID</Table.HeaderCell>
              <Table.HeaderCell>Cart ID</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {quotes.map((quote) => (
              <Table.Row key={quote.id}>
                <Table.Cell>{quote.id.slice(0, 8)}...</Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(quote.status)}>
                    {formatStatus(quote.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{quote.customer_id?.slice(0, 8) || "N/A"}...</Table.Cell>
                <Table.Cell>{quote.cart_id?.slice(0, 8) || "N/A"}...</Table.Cell>
                <Table.Cell>
                  {new Date(quote.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <a
                    href={`#/quotes/${quote.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Quotes",
})

export default QuotesPage
