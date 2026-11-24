import { redirect } from "next/navigation"

export default async function CatalogApplicationRedirect({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  redirect(`/products?application=${handle}`)
}
