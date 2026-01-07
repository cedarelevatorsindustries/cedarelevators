"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditCategoryPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()

  useEffect(() => {
    // Redirect to create page with id query param
    router.push(`/admin/categories/create?id=${resolvedParams.id}`)
  }, [resolvedParams.id, router])

  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  )
}
