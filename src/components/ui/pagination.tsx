import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
            {/* Left side: Results info and Page size selector */}
            <div className="flex items-center gap-6">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-bold text-gray-900">{startItem}-{endItem}</span> of{' '}
                    <span className="font-bold text-gray-900">{totalItems}</span> results
                </p>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Show:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="w-[70px] h-9 rounded-lg border-gray-200 bg-white text-sm focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Right side: Page navigation */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                    ...
                                </span>
                            )
                        }

                        return (
                            <Button
                                key={page}
                                variant="ghost"
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                className={`h-9 w-9 p-0 rounded-full font-medium transition-colors ${currentPage === page
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </Button>
                        )
                    })}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
