/**
 * CSV Service Utilities
 */

export function convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header]
                return `"${String(value).replace(/"/g, '""')}"`
            }).join(',')
        ),
    ]

    return csvRows.join('\n')
}

export const CSVService = {
    exportInventoryToCSV(inventory: any[]): string {
        if (inventory.length === 0) return ''

        const data = inventory.map(item => ({
            'Product Name': item.product_name || item.name || '',
            'SKU': item.sku || '',
            'Current Stock': item.stock_quantity ?? item.current_stock ?? 0,
            'Reorder Level': item.low_stock_threshold ?? item.reorder_level ?? 0,
            'Status': item.stock_status || (item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'),
            'Last Updated': item.updated_at || '',
        }))

        return convertToCSV(data)
    },

    downloadCSV(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
    }
}
