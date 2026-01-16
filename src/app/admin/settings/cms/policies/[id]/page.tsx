import { getCMSPageById } from "@/lib/actions/admin-cms"
import { CMSPageEditor } from "@/components/admin/cms-page-editor"
import { notFound } from "next/navigation"

const POLICY_SLUGS = {
    'privacy': 'privacy-policy',
    'terms': 'terms-conditions',
    'return': 'return-policy',
    'shipping': 'shipping-policy'
}

interface PolicyEditPageProps {
    params: {
        id: 'privacy' | 'terms' | 'return' | 'shipping'
    }
}

export default async function EditPolicyPage({ params }: PolicyEditPageProps) {
    const slug = POLICY_SLUGS[params.id]

    if (!slug) {
        notFound()
    }

    // Fetch page by slug instead of ID
    const { getAllCMSPages } = await import("@/lib/actions/admin-cms")
    const pages = await getAllCMSPages()
    const page = pages.find(p => p.slug === slug)

    if (!page) {
        notFound()
    }

    return <CMSPageEditor page={page} />
}
