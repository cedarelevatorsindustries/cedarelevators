import { getCMSPageById } from "@/lib/actions/admin-cms"
import { CMSPageEditor } from "@/components/admin/cms-page-editor"
import { notFound } from "next/navigation"

interface EditPageProps {
    params: {
        id: string
    }
}

export default async function EditCMSPage({ params }: EditPageProps) {
    const page = await getCMSPageById(params.id)

    if (!page) {
        notFound()
    }

    return <CMSPageEditor page={page} />
}
