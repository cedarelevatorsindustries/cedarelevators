import { getCMSPageById, getAllCMSPages } from "@/lib/actions/admin-cms"
import { CMSPageEditor } from "@/components/admin/cms-page-editor"
import { notFound } from "next/navigation"

export const metadata = {
    title: "Warranty Information | Admin"
}

export default async function EditWarrantyPage() {
    // Fetch the warranty-information page
    const pages = await getAllCMSPages()
    const page = pages.find(p => p.slug === 'warranty-information')

    if (!page) {
        notFound()
    }

    return <CMSPageEditor page={page} />
}
