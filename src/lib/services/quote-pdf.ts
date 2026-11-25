import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPDFCurrency } from '@/lib/utils/quote-pricing'

export const QUOTE_PDF_BUCKET = 'quote-documents'

export interface QuotePdfCompanySnapshot {
  name: string
  addressLine1: string
  addressLine2?: string | null
  cityStatePin: string
  country: string
  phone: string
  email: string
  gstin?: string | null
}

export interface QuotePdfCustomerSnapshot {
  name: string
  email: string
  phone: string
  companyName?: string | null
  gstNumber?: string | null
  projectName?: string | null
  projectLocation?: string | null
}

export interface QuotePdfItemSnapshot {
  productName: string
  sku?: string | null
  variantTitle?: string | null
  specifications?: Record<string, any> | null
  quantity: number
  unitPrice: number
  discountPercentage: number
  discountAmount: number
  lineTotal: number
}

export interface QuotePdfPayload {
  quoteNumber: string
  revisionNumber: number
  issuedAt: string
  validUntil: string
  currency: string
  company: QuotePdfCompanySnapshot
  customer: QuotePdfCustomerSnapshot
  items: QuotePdfItemSnapshot[]
  subtotal: number
  discountTotal: number
  taxableAmount: number
  taxEnabled: boolean
  taxRate: number
  taxTotal: number
  grandTotal: number
  customerMessage?: string | null
  termsAndConditions?: string | null
  isDraft?: boolean
}

function loadCedarLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo', 'cedarelevators.png')
    if (!fs.existsSync(logoPath)) return null
    const buf = fs.readFileSync(logoPath)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

function formatDateIN(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatSpecSummary(specs?: Record<string, any> | null): string {
  if (!specs || typeof specs !== 'object') return ''
  const entries = Object.entries(specs)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${String(v)}`)
  return entries.join(' | ')
}

/**
 * Generates an official, multi-page Cedar Elevators Quotation PDF as a Buffer.
 * Strictly excludes all private internal admin notes.
 */
export function generateQuotationPdfBuffer(data: QuotePdfPayload): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  const brandOrange: [number, number, number] = [234, 88, 12]
  const darkSlate: [number, number, number] = [17, 24, 39]
  const mutedSlate: [number, number, number] = [107, 114, 128]
  const borderGray: [number, number, number] = [229, 231, 235]
  const softBg: [number, number, number] = [249, 250, 251]

  // Top industrial accent strip
  doc.setFillColor(...brandOrange)
  doc.rect(0, 0, pageWidth, 4, 'F')

  // Header Section
  let y = 14
  const logoData = loadCedarLogoBase64()
  if (logoData) {
    doc.addImage(logoData, 'PNG', margin, y, 38, 16)
  }

  // Company details (Left below logo or aligned)
  const companyX = margin
  let companyY = logoData ? y + 20 : y + 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...darkSlate)
  doc.text(data.company.name.trim().toUpperCase(), companyX, companyY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...mutedSlate)
  companyY += 4.5
  if (data.company.addressLine1) {
    doc.text(
      [data.company.addressLine1, data.company.addressLine2].filter(Boolean).join(', '),
      companyX,
      companyY
    )
    companyY += 4
  }
  doc.text(`${data.company.cityStatePin}, ${data.company.country}`, companyX, companyY)
  companyY += 4
  doc.text(`Ph: ${data.company.phone}  |  Email: ${data.company.email}`, companyX, companyY)
  if (data.company.gstin) {
    companyY += 4
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkSlate)
    doc.text(`GSTIN: ${data.company.gstin}`, companyX, companyY)
  }

  // Right-side Quotation Title & Metadata Card
  const metaBoxW = 74
  const metaBoxX = pageWidth - margin - metaBoxW
  const metaBoxY = y
  doc.setFillColor(...softBg)
  doc.setDrawColor(...borderGray)
  doc.roundedRect(metaBoxX, metaBoxY, metaBoxW, 38, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...brandOrange)
  doc.text(
    data.isDraft ? 'DRAFT PREVIEW' : 'QUOTATION',
    metaBoxX + metaBoxW - 4,
    metaBoxY + 8,
    { align: 'right' }
  )

  const metaRows: Array<[string, string]> = [
    ['Quote #:', data.quoteNumber],
    ['Revision:', data.isDraft ? 'Draft (Unissued)' : `Rev ${data.revisionNumber}`],
    [data.isDraft ? 'Prepared:' : 'Issue Date:', formatDateIN(data.issuedAt)],
    ['Valid Until:', formatDateIN(data.validUntil)],
  ]

  let metaRowY = metaBoxY + 15
  doc.setFontSize(8.5)
  for (const [label, val] of metaRows) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...mutedSlate)
    doc.text(label, metaBoxX + 4, metaRowY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkSlate)
    doc.text(val, metaBoxX + metaBoxW - 4, metaRowY, { align: 'right' })
    metaRowY += 5.5
  }

  // Divider
  y = Math.max(companyY + 6, metaBoxY + 44)
  doc.setDrawColor(...borderGray)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)

  // Customer & Project Details Card
  y += 5
  const custBoxStartY = y
  const colMid = margin + contentWidth * 0.55

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...mutedSlate)
  doc.text('QUOTATION PREPARED FOR', margin, y + 4)
  if (data.customer.projectName || data.customer.projectLocation) {
    doc.text('PROJECT DETAILS', colMid, y + 4)
  }

  let custY = y + 9.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkSlate)
  doc.text(data.customer.name, margin, custY)
  custY += 4.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  if (data.customer.companyName) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.customer.companyName, margin, custY)
    doc.setFont('helvetica', 'normal')
    custY += 4
  }
  if (data.customer.gstNumber) {
    doc.text(`Customer GSTIN: ${data.customer.gstNumber}`, margin, custY)
    custY += 4
  }
  doc.setTextColor(...mutedSlate)
  doc.text(`Email: ${data.customer.email}`, margin, custY)
  custY += 4
  doc.text(`Phone: ${data.customer.phone}`, margin, custY)

  let projY = custBoxStartY + 9.5
  if (data.customer.projectName) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkSlate)
    doc.text(data.customer.projectName, colMid, projY)
    projY += 4.5
  }
  if (data.customer.projectLocation) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...mutedSlate)
    doc.text(`Location: ${data.customer.projectLocation}`, colMid, projY)
    projY += 4
  }

  y = Math.max(custY, projY) + 6

  // Product Pricing Table
  const tableBody =
    data.items.length > 0
      ? data.items.map((item, idx) => {
          const specLine = formatSpecSummary(item.specifications)
          const descLines = [item.productName]
          if (item.variantTitle) descLines.push(`Variant: ${item.variantTitle}`)
          if (specLine) descLines.push(specLine)

          return [
            (idx + 1).toString(),
            descLines.join('\n'),
            item.sku || '-',
            item.quantity.toString(),
            formatPDFCurrency(item.unitPrice),
            item.discountPercentage > 0 ? `${item.discountPercentage}%` : '-',
            formatPDFCurrency(item.lineTotal),
          ]
        })
      : [
          [
            '1',
            'Custom Engineering / General Quotation Package',
            '-',
            '1',
            formatPDFCurrency(data.subtotal),
            '-',
            formatPDFCurrency(data.subtotal),
          ],
        ]

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item & Specifications', 'SKU', 'Qty', 'Unit Price', 'Disc', 'Line Total']],
    body: tableBody,
    theme: 'grid',
    showHead: 'everyPage',
    headStyles: {
      fillColor: darkSlate,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkSlate,
      cellPadding: 3,
      lineColor: borderGray,
      lineWidth: 0.2,
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 68, halign: 'left' },
      2: { cellWidth: 25, halign: 'left' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: 26 },
  })

  let afterTableY = (doc as any).lastAutoTable.finalY + 6

  // Check if summary + notes fit on current page
  if (afterTableY > pageHeight - 85) {
    doc.addPage()
    afterTableY = 18
  }

  // Financial Summary (Right aligned) + Customer Notes (Left)
  const summaryW = 76
  const summaryX = pageWidth - margin - summaryW
  const notesW = contentWidth - summaryW - 8

  if (data.customerMessage) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...darkSlate)
    doc.text('Commercial Notes', margin, afterTableY + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...mutedSlate)
    const msgLines = doc.splitTextToSize(data.customerMessage, notesW)
    doc.text(msgLines, margin, afterTableY + 8)
  }

  doc.setFillColor(...softBg)
  doc.setDrawColor(...borderGray)
  const summaryRows: Array<{ label: string; value: string; bold?: boolean; accent?: boolean }> = [
    { label: 'Subtotal', value: formatPDFCurrency(data.subtotal) },
  ]
  if (data.discountTotal > 0) {
    summaryRows.push({
      label: 'Discount',
      value: `- ${formatPDFCurrency(data.discountTotal)}`,
    })
  }
  summaryRows.push({ label: 'Taxable Amount', value: formatPDFCurrency(data.taxableAmount) })
  if (data.taxEnabled && data.taxRate > 0) {
    summaryRows.push({
      label: `GST (${data.taxRate}%)`,
      value: formatPDFCurrency(data.taxTotal),
    })
  }
  summaryRows.push({
    label: `Grand Total (${data.currency})`,
    value: formatPDFCurrency(data.grandTotal),
    bold: true,
    accent: true,
  })

  const boxH = summaryRows.length * 6.5 + 8
  doc.roundedRect(summaryX, afterTableY, summaryW, boxH, 2, 2, 'FD')

  let sy = afterTableY + 6.5
  for (const row of summaryRows) {
    if (row.accent) {
      doc.setDrawColor(...borderGray)
      doc.line(summaryX + 4, sy - 4, summaryX + summaryW - 4, sy - 4)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...brandOrange)
    } else {
      doc.setFont('helvetica', row.bold ? 'bold' : 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...mutedSlate)
    }
    doc.text(row.label, summaryX + 4, sy)
    if (!row.accent) {
      doc.setTextColor(...darkSlate)
      doc.setFont('helvetica', 'bold')
    }
    doc.text(row.value, summaryX + summaryW - 4, sy, { align: 'right' })
    sy += 6.5
  }

  let termsY = afterTableY + boxH + 10

  if (data.termsAndConditions && data.termsAndConditions.trim().length > 0) {
    if (termsY > pageHeight - 40) {
      doc.addPage()
      termsY = 18
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...darkSlate)
    doc.text('Terms & Conditions', margin, termsY)
    termsY += 4.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(...mutedSlate)
    const termsLines = doc.splitTextToSize(data.termsAndConditions.trim(), contentWidth)
    doc.text(termsLines, margin, termsY)
  }

  // Consistent Footer + Page Numbering across every page
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const footerY = pageHeight - 12
    doc.setDrawColor(...borderGray)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...mutedSlate)
    doc.text(
      `${data.company.name.trim()} • Official Quotation ${data.quoteNumber} (Rev ${data.revisionNumber}) • Valid until ${formatDateIN(data.validUntil)}`,
      margin,
      footerY + 1
    )
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY + 1, { align: 'right' })
  }

  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Uploads the immutable quotation PDF to private Supabase Storage and verifies retrievability.
 */
export async function uploadQuotePdfToPrivateStorage(params: {
  quoteId: string
  revisionNumber: number
  pdfBuffer: Buffer
}): Promise<{
  bucket: string
  path: string
  sizeBytes: number
  sha256: string
}> {
  const supabase = createAdminClient()
  const storagePath = `${params.quoteId}/rev-${params.revisionNumber}.pdf`
  const sha256 = crypto.createHash('sha256').update(params.pdfBuffer).digest('hex')

  const { error: uploadError } = await supabase.storage
    .from(QUOTE_PDF_BUCKET)
    .upload(storagePath, params.pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false, // Never overwrite an existing revision PDF
    })

  if (uploadError) {
    throw new Error(`PDF storage upload failed: ${uploadError.message}`)
  }

  // Verify the uploaded PDF is immediately retrievable before allowing issuance to complete
  const { data: verifyData, error: verifyError } = await supabase.storage
    .from(QUOTE_PDF_BUCKET)
    .download(storagePath)

  if (verifyError || !verifyData || verifyData.size === 0) {
    throw new Error(`PDF storage verification failed: ${verifyError?.message || 'Empty file'}`)
  }

  return {
    bucket: QUOTE_PDF_BUCKET,
    path: storagePath,
    sizeBytes: params.pdfBuffer.byteLength,
    sha256,
  }
}

export async function downloadQuotePdfFromStorage(storagePath: string): Promise<Buffer> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from(QUOTE_PDF_BUCKET).download(storagePath)

  if (error || !data) {
    throw new Error(`Failed to retrieve quotation PDF: ${error?.message || 'Not found'}`)
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Shared customer PDF resolver:
 * Streams the exact stored revision PDF from private Supabase Storage,
 * or falls back cleanly for legacy pre-Phase-1 'approved' quotes without stored PDFs.
 */
export async function resolveCustomerIssuedPdfBuffer(quote: any): Promise<{
  pdfBuffer: Buffer
  filename: string
}> {
  const supabase = createAdminClient()
  const { data: latestRevision } = await supabase
    .from('quote_revisions')
    .select('revision_number, pdf_storage_path')
    .eq('quote_id', quote.id)
    .order('revision_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestRevision?.pdf_storage_path) {
    const pdfBuffer = await downloadQuotePdfFromStorage(latestRevision.pdf_storage_path)
    return {
      pdfBuffer,
      filename: `${quote.quote_number}-Rev${latestRevision.revision_number}.pdf`,
    }
  }

  // Legacy 'approved' fallback
  const [{ data: storeSettings }, { data: taxSettings }] = await Promise.all([
    supabase.from('store_settings').select('*').limit(1).maybeSingle(),
    supabase.from('tax_settings').select('*').limit(1).maybeSingle(),
  ])

  const items = quote.items || []
  const taxEnabled = Number(quote.tax_total || 0) > 0
  const subtotal = Number(quote.subtotal || 0)
  const discountTotal = Number(quote.discount_total || 0)
  const taxableAmount = Math.max(0, subtotal - discountTotal)
  const taxTotal = Number(quote.tax_total || 0)
  const grandTotal = Number(quote.estimated_total || taxableAmount + taxTotal)

  const pdfBuffer = generateQuotationPdfBuffer({
    quoteNumber: quote.quote_number,
    revisionNumber: 1,
    issuedAt: quote.issued_at || quote.approved_at || quote.created_at,
    validUntil: quote.valid_until || new Date(Date.now() + 30 * 86400000).toISOString(),
    currency: quote.currency || 'INR',
    company: {
      name: (storeSettings?.store_name || 'Cedar Elevators Industries').trim(),
      addressLine1: storeSettings?.address_line1 || '',
      addressLine2: storeSettings?.address_line2 || null,
      cityStatePin: [storeSettings?.city, storeSettings?.state, storeSettings?.postal_code]
        .filter(Boolean)
        .join(', '),
      country: storeSettings?.country || 'India',
      phone: storeSettings?.support_phone || '',
      email: storeSettings?.support_email || '',
      gstin: taxSettings?.store_gstin || storeSettings?.gst_number || null,
    },
    customer: {
      name: quote.requester_name || quote.guest_name || 'Customer',
      email: quote.requester_email || quote.guest_email || '',
      phone: quote.requester_phone || quote.guest_phone || '',
      companyName: quote.company_name || null,
      gstNumber: quote.gst_number || null,
      projectName: quote.project_name || null,
      projectLocation: quote.project_location || null,
    },
    items: items.map((item: any) => ({
      productName: item.product_name,
      sku: item.variant_sku || item.product_sku || null,
      variantTitle: item.variant_title || null,
      specifications: item.specifications || null,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price || 0),
      discountPercentage: Number(item.discount_percentage || 0),
      discountAmount: Number(item.discount_amount || 0),
      lineTotal: Number(item.line_total ?? item.total_price ?? 0),
    })),
    subtotal,
    discountTotal,
    taxableAmount,
    taxEnabled,
    taxRate: Number(quote.tax_rate || taxSettings?.default_gst_percentage || 18),
    taxTotal,
    grandTotal,
    customerMessage: quote.admin_response_message || null,
    termsAndConditions: quote.terms_and_conditions || null,
  })

  return {
    pdfBuffer,
    filename: `${quote.quote_number}.pdf`,
  }
}
