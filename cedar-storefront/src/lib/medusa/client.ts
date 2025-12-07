import Medusa from "@medusajs/js-sdk"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn("Missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
}

export const medusaClient = new Medusa({
  baseUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey,
  globalHeaders: {
    "x-publishable-api-key": publishableKey || "",
  },
})

export default medusaClient
