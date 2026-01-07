"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditApplicationRedirect({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)

  useEffect(() => {
    router.replace(`/admin/applications/create?id=${resolvedParams.id}`)
  }, [resolvedParams.id, router])

  return null
}
