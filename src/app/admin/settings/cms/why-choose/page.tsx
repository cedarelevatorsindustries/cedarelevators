import { getCMSPageById, getAllCMSPages } from "@/lib/actions/admin-cms"
import { CMSPageEditor } from "@/components/admin/cms-page-editor"
import { notFound } from "next/navigation"

export const metadata = {
    title: "Why Choose Cedar | Admin"
}

export default async function EditWhyChoosePage() {
    // Fetch the why-choose-cedar page
    const pages = await getAllCMSPages()
    const page = pages.find(p => p.slug === 'why-choose-cedar')

    if (!page) {
        notFound()
    }

    return <CMSPageEditor page={page} />
}
