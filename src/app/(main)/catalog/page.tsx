import { redirect } from "next/navigation"

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, val] of Object.entries(params)) {
    if (typeof val === "string") {
      query.set(key, val)
    } else if (Array.isArray(val)) {
      val.forEach(v => query.append(key, v))
    }
  }

  const queryString = query.toString()
  redirect(`/products${queryString ? `?${queryString}` : ""}`)
}
