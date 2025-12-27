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
