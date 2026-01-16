import { getAllCMSPages } from "@/lib/actions/admin-cms"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Plus, Edit, ExternalLink } from "lucide-react"

export const metadata = {
    title: "CMS Pages | Admin"
}

export default async function CMSPagesListPage() {
    const pages = await getAllCMSPages()

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage content for {pages.length} pages
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/settings/cms/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Page
                    </Link>
                </Button>
            </div>

            {/* Pages Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Page
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {page.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    /{page.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant={page.is_published ? "default" : "secondary"}
                                            className={
                                                page.is_published
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : "bg-gray-100 text-gray-800"
                                            }
                                        >
                                            {page.is_published ? "Published" : "Draft"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        v{page.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(page.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {page.is_published && (
                                                <Link
                                                    href={`/${page.slug}`}
                                                    target="_blank"
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="View published page"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            )}
                                            <Link
                                                href={`/admin/settings/cms/${page.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pages.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No pages yet
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Get started by creating your first CMS page
                        </p>
                        <Button asChild>
                            <Link href="/admin/settings/cms/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Page
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
