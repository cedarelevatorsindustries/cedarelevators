/**
 * Export utilities for CSV, PDF, and ZIP downloads
 */

// Helper function to download files
function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = typeof content === 'string' 
    ? new Blob([content], { type: mimeType })
    : content
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// CSV Export
export async function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const keys = headers || Object.keys(data[0])
  const csvHeaders = keys.join(',')
  
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key]
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  )

  const csv = [csvHeaders, ...csvRows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

// Quote Export
export async function exportQuotesToCSV(quotes: any[]) {
  const data = quotes.map(q => ({
    'Quote ID': q.quote_number,
    'Date': new Date(q.created_at).toLocaleDateString(),
    'Customer': q.customer_name || 'N/A',
    'Amount': q.total_amount,
    'Status': q.status,
    'Items': q.items?.length || 0,
    'Valid Until': q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'N/A'
  }))

  await exportToCSV(data, `quotes-${Date.now()}`)
}

// Order Export
export async function exportOrdersToCSV(orders: any[]) {
  const data = orders.map(o => ({
    'Order ID': o.display_id,
    'Date': new Date(o.created_at).toLocaleDateString(),
    'Total': o.total,
    'Status': o.status,
    'Payment': o.payment_status,
    'Items': o.items?.length || 0,
    'Shipping': o.shipping_address?.city || 'N/A'
  }))

  await exportToCSV(data, `orders-${Date.now()}`)
}

// Invoice Export
export async function exportInvoicesToCSV(invoices: any[]) {
  const data = invoices.map(inv => ({
    'Invoice ID': inv.invoice_number,
    'Order ID': inv.order_id,
    'Date': new Date(inv.created_at).toLocaleDateString(),
    'Amount': inv.total_amount,
    'Tax': inv.tax_amount,
    'Status': inv.payment_status,
    'Due Date': inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'
  }))

  await exportToCSV(data, `invoices-${Date.now()}`)
}

// PDF Export (requires jsPDF library)
export async function exportToPDF(content: string, filename: string) {
  // This is a placeholder - implement with jsPDF when needed
  console.log('PDF export:', { content, filename })
  throw new Error('PDF export not yet implemented. Install jsPDF library.')
}

// ZIP Export (requires JSZip library)
export async function downloadFilesAsZip(files: { name: string; content: Blob }[], zipFilename: string) {
  try {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    files.forEach(file => {
      zip.file(file.name, file.content)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    downloadFile(content, `${zipFilename}.zip`, 'application/zip')
  } catch (error) {
    console.error('Failed to create ZIP:', error)
    throw new Error('ZIP creation failed. Make sure jszip is installed.')
  }
}

// Invoice ZIP Download
export async function downloadInvoicesAsZip(invoiceIds: string[]) {
  // Placeholder - implement when invoice PDF generation is ready
  const files = invoiceIds.map(id => ({
    name: `invoice-${id}.pdf`,
    content: new Blob(['Invoice content'], { type: 'application/pdf' })
  }))

  await downloadFilesAsZip(files, `invoices-${Date.now()}`)
}
