import { redirect } from 'next/navigation'

interface VariantsListPageProps {
  params: Promise<{ id: string }>
}

export default async function VariantsListPage({ params }: VariantsListPageProps) {
  const { id } = await params

  // Redirect to product detail page since variants are now shown inline
  redirect(`/admin/products/${id}`)
}
