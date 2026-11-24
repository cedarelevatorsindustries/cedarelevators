import { redirect } from "next/navigation"

export default async function CatalogTypeRedirect({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  redirect(`/products?type=${handle}`)
}
