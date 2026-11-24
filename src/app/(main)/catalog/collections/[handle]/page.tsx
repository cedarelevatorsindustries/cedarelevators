import { redirect } from "next/navigation"

export default async function CatalogCollectionRedirect({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  redirect(`/products?collection=${handle}`)
}
