import { redirect } from "next/navigation"

export default async function CategoryHandleRedirect({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  redirect(`/products?category=${handle}`)
}
