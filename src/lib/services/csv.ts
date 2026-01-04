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
    },

    generateInventoryTemplate(): string {
        const headers = ['variant_id', 'sku', 'adjustment_type', 'quantity', 'reason', 'low_stock_threshold']
        const sampleRow = ['variant-uuid-here', 'SAMPLE-SKU', 'add', '10', 'Initial stock', '5']
        return `${headers.join(',')}\n${sampleRow.join(',')}`
    },

    parseInventoryCSV(csvText: string): {
        success: boolean
        data?: Array<{
            variant_id: string
            sku: string
            adjustment_type: string
            quantity: string
            reason: string
            low_stock_threshold?: string
        }>
        errors?: string[]
    } {
        const errors: string[] = []
        const lines = csvText.trim().split('\n')

        if (lines.length < 2) {
            return { success: false, errors: ['CSV file is empty or has no data rows'] }
        }

        const headers = lines[0].split(',').map(h => h.trim())
        const requiredHeaders = ['variant_id', 'adjustment_type', 'quantity']
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

        if (missingHeaders.length > 0) {
            return {
                success: false,
                errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
            }
        }

        const data: any[] = []

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const values = line.split(',').map(v => v.trim())
            const row: any = {}

            headers.forEach((header, index) => {
                row[header] = values[index] || ''
            })

            // Validate required fields
            if (!row.variant_id) {
                errors.push(`Row ${i}: Missing variant_id`)
                continue
            }

            if (!row.quantity || isNaN(parseInt(row.quantity))) {
                errors.push(`Row ${i}: Invalid or missing quantity`)
                continue
            }

            if (!['add', 'subtract', 'set'].includes(row.adjustment_type)) {
                errors.push(`Row ${i}: Invalid adjustment_type (must be add, subtract, or set)`)
                continue
            }

            data.push(row)
        }

        if (data.length === 0) {
            return { success: false, errors: errors.length > 0 ? errors : ['No valid data rows found'] }
        }

        return { success: true, data, errors: errors.length > 0 ? errors : undefined }
    }
}

