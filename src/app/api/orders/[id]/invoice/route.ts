import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/data/orders'
import { auth } from '@clerk/nextjs/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'
import { getStoreSettings } from '@/lib/services/settings'
import fs from 'fs'
import path from 'path'

// Helper function to convert number to words
function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    if (num === 0) return 'Zero'

    function convertLessThanThousand(n: number): string {
        if (n === 0) return ''
        if (n < 20) return ones[n]
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' And ' + convertLessThanThousand(n % 100) : '')
    }

    // Indian numbering system
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const remainder = Math.floor(num % 1000)

    let result = ''
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore, '
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh, '
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand, '
    if (remainder > 0) result += convertLessThanThousand(remainder)

    return result.replace(/, $/, '')
}

// Helper to format Indian currency
function formatIndianCurrency(amount: number): string {
    const formatted = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    return `Rs.${formatted}`  // Using Rs. instead of ₹ for better PDF compatibility
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        const adminUser = await getCurrentAdminUser()

        if (!userId && !adminUser) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params
        const order = await getOrderById(id)

        if (!order) {
            return new NextResponse('Order not found', { status: 404 })
        }

        if (!adminUser && order.clerk_user_id !== userId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // Fetch company settings from database
        const settingsResult = await getStoreSettings()
        const companySettings = settingsResult.data

        // Fallback company details if settings not found
        const companyName = companySettings?.store_name || 'CEDAR ELEVATORS INDUSTRIES'
        const companyGSTIN = companySettings?.gst_number || '33TZCPS1782R1Z6'
        const companyAddress = companySettings?.address_line1 || '67/37, D.S.COMPLEX, NORTH MADA VEETHI, CHENNAI'
        const companyCity = companySettings?.city || 'Chennai'
        const companyState = companySettings?.state || 'TAMIL NADU'
        const companyPostalCode = companySettings?.postal_code || '600050'
        const companyPhone = companySettings?.support_phone || '+91 8220202757'
        const companySecondaryPhone = companySettings?.secondary_phone
        const companyEmail = companySettings?.support_email || 'cedarelevatorsindustries@gmail.com'

        // Create PDF (A4 size)
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })

        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height
        const margin = 10  // 10mm padding on all sides

        // Load and embed logo
        let logoData = ''
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo', 'cedarelevators.png')
            const logoBuffer = fs.readFileSync(logoPath)
            logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`
        } catch (error) {
            console.error('Error loading logo:', error)
        }

        // Load and embed QR code
        let qrCodeData = ''
        try {
            const qrPath = path.join(process.cwd(), 'public', 'images', 'image copy.png')
            const qrBuffer = fs.readFileSync(qrPath)
            qrCodeData = `data:image/png;base64,${qrBuffer.toString('base64')}`
        } catch (error) {
            console.error('Error loading QR code:', error)
        }

        // Colors matching HTML
        const primaryBlue = [29, 78, 216] as [number, number, number]  // #1d4ed8
        const textBlack = [0, 0, 0] as [number, number, number]
        const textGray = [100, 116, 139] as [number, number, number]  // slate-500
        const borderBlack = [0, 0, 0] as [number, number, number]
        const bgLight = [248, 250, 252] as [number, number, number]  // slate-50

        // ============================================
        // OVERALL BORDER
        // ============================================
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2))

        // ============================================
        // HEADER BAR  
        // ============================================
        const contentWidth = pageWidth - (margin * 2)
        const startX = margin
        let currentY = margin + 8

        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, currentY, startX + contentWidth, currentY)

        doc.setFontSize(11)
        doc.setTextColor(...primaryBlue)
        doc.setFont('helvetica', 'bold')
        doc.text('TAX INVOICE', pageWidth / 2, currentY - 2, { align: 'center' })

        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text('ORIGINAL FOR RECIPIENT', startX + contentWidth - 2, currentY - 2, { align: 'right' })

        // ============================================
        // COMPANY INFO (LEFT) + INVOICE DETAILS (RIGHT)  
        // ============================================
        const sectionHeight = 65  // Increased to prevent content overflow
        doc.line(startX, currentY, startX, currentY + sectionHeight)  // Left border
        doc.line(startX + contentWidth, currentY, startX + contentWidth, currentY + sectionHeight)  // Right border
        doc.line(startX, currentY + sectionHeight, startX + contentWidth, currentY + sectionHeight)  // Bottom border

        // Vertical divider between left and right
        const dividerX = startX + (contentWidth / 2)
        doc.line(dividerX, currentY, dividerX, currentY + sectionHeight)

        // LEFT SIDE: Logo on top, Company Details below
        let yPos = currentY + 4
        const logoWidth = 45  // Increased width
        const logoHeight = 24  // Proper height to maintain aspect ratio
        const logoX = startX + 4

        if (logoData) {
            // Real logo on top
            doc.addImage(logoData, 'PNG', logoX, yPos, logoWidth, logoHeight)
            yPos += logoHeight + 3  // Move down after logo
        } else {
            // Placeholder - blue circle with "C"
            doc.setFillColor(...primaryBlue)
            doc.circle(logoX + 6, yPos + 6, 6, 'F')
            doc.setFontSize(14)
            doc.setTextColor(255, 255, 255)
            doc.setFont('helvetica', 'bold')
            doc.text('C', logoX + 6, yPos + 8, { align: 'center' })
            yPos += 15  // Move down after placeholder
        }

        // Company details start below logo
        const textStartX = startX + 4

        // Company name
        doc.setFontSize(9)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text(companyName.toUpperCase(), textStartX, yPos)

        yPos += 4
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(`GSTIN: ${companyGSTIN}`, textStartX, yPos)

        yPos += 4
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        const companyLines = [
            companyAddress,
            `${companyCity}, ${companyState}, ${companyPostalCode}`,
            `Mobile: ${companyPhone}${companySecondaryPhone ? ', ' + companySecondaryPhone : ''}`,
            `Email: ${companyEmail}`
        ]

        companyLines.forEach(line => {
            doc.text(line, textStartX, yPos)
            yPos += 3.2
        })// RIGHT SIDE: Invoice Details 2x2 Grid  
        const gridStartX = dividerX
        const gridWidth = (startX + contentWidth) - dividerX
        const cellHeight = 12

        // Grid borders
        const gridTop = currentY
        doc.line(gridStartX, gridTop, startX + contentWidth, gridTop)  // Top
        doc.line(gridStartX, gridTop + cellHeight, startX + contentWidth, gridTop + cellHeight)  // Middle horizontal
        doc.line(gridStartX, gridTop + cellHeight * 2, startX + contentWidth, gridTop + cellHeight * 2)  // Bottom horizontal
        doc.line(gridStartX + gridWidth / 2, gridTop, gridStartX + gridWidth / 2, gridTop + cellHeight)  // Top vertical divider
        doc.line(gridStartX + gridWidth / 2, gridTop + cellHeight, gridStartX + gridWidth / 2, gridTop + cellHeight * 2)  // Bottom vertical divider

        const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

        doc.setFontSize(7)

        // Invoice # (Top Left)
        doc.setTextColor(...textGray)
        doc.setFont('helvetica', 'bold')
        doc.text('Invoice #:', gridStartX + 2, gridTop + 4)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text(order.order_number || 'N/A', gridStartX + 2, gridTop + 8)

        // Invoice Date (Top Right)
        doc.setTextColor(...textGray)
        doc.setFont('helvetica', 'bold')
        doc.text('Invoice Date:', gridStartX + gridWidth / 2 + 2, gridTop + 4)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text(invoiceDate, gridStartX + gridWidth / 2 + 2, gridTop + 8)

        // Place of Supply (Bottom Left)
        doc.setTextColor(...textGray)
        doc.setFont('helvetica', 'bold')
        doc.text('Place of Supply:', gridStartX + 2, gridTop + cellHeight + 4)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text('33-TAMIL NADU', gridStartX + 2, gridTop + cellHeight + 8)

        // Due Date (Bottom Right)
        doc.setTextColor(...textGray)
        doc.setFont('helvetica', 'bold')
        doc.text('Due Date:', gridStartX + gridWidth / 2 + 2, gridTop + cellHeight + 4)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text(invoiceDate, gridStartX + gridWidth / 2 + 2, gridTop + cellHeight + 8)

        // ============================================
        // CUSTOMER DETAILS
        // ============================================
        currentY = currentY + sectionHeight + 4
        doc.line(startX, currentY, startX + contentWidth, currentY)  // Top border
        yPos = currentY + 3

        doc.setFontSize(7)
        doc.setTextColor(...textGray)
        doc.setFont('helvetica', 'bold')
        doc.text('Customer Details:', startX + 4, yPos)

        yPos += 4
        doc.setFontSize(8)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        const customerName = order.billing_address?.name || 'Customer'
        doc.text(customerName, startX + 4, yPos)

        // Company name if available (from business_profile)
        if (order.business_profile?.company_name) {
            yPos += 4
            doc.setFontSize(7)
            doc.setFont('helvetica', 'bold')
            doc.text(order.business_profile.company_name.toUpperCase(), startX + 4, yPos)
        }

        // GSTIN if available
        if (order.billing_address?.gstin) {
            yPos += 4
            doc.setFontSize(7)
            doc.setFont('helvetica', 'bold')
            doc.text(`GSTIN: ${order.billing_address.gstin}`, startX + 4, yPos)
        }

        // Billing Address
        yPos += 4
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('Billing Address:', startX + 4, yPos)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        yPos += 3.2
        const addressLines = []
        if (order.billing_address?.address_line1) addressLines.push(order.billing_address.address_line1)
        if (order.billing_address?.address_line2) addressLines.push(order.billing_address?.address_line2)

        const cityState = `${order.billing_address?.city || ''}, ${order.billing_address?.state || 'TAMIL NADU'}, ${order.billing_address?.postal_code || order.billing_address?.pincode || ''}`
        addressLines.push(cityState)

        if (order.billing_address?.phone) addressLines.push(`Ph: ${order.billing_address.phone}`)

        addressLines.forEach(line => {
            doc.text(line, startX + 4, yPos)
            yPos += 3.2
        })

        // Shipping Address or Store Pickup
        yPos += 2
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')

        if (order.shipping_method === 'pickup') {
            // Store Pickup
            doc.text('Pickup Location:', startX + 4, yPos)

            doc.setFont('helvetica', 'normal')
            yPos += 3.2

            // Store pickup address
            const pickupLines = [
                companyName.toUpperCase(),
                companyAddress,
                `${companyCity}, ${companyState}, ${companyPostalCode}`,
                `Ph: ${companyPhone}`
            ]

            pickupLines.forEach(line => {
                doc.text(line, startX + 4, yPos)
                yPos += 3.2
            })
        } else {
            // Shipping Address
            doc.text('Shipping Address:', startX + 4, yPos)

            doc.setFont('helvetica', 'normal')
            yPos += 3.2

            const shippingLines = []
            if (order.shipping_address?.name) shippingLines.push(order.shipping_address.name)
            if (order.shipping_address?.address_line1) shippingLines.push(order.shipping_address.address_line1)
            if (order.shipping_address?.address_line2) shippingLines.push(order.shipping_address.address_line2)

            const shippingCityState = `${order.shipping_address?.city || ''}, ${order.shipping_address?.state || 'TAMIL NADU'}, ${order.shipping_address?.postal_code || order.shipping_address?.pincode || ''}`
            shippingLines.push(shippingCityState)

            if (order.shipping_address?.phone) shippingLines.push(`Ph: ${order.shipping_address.phone}`)

            shippingLines.forEach(line => {
                doc.text(line, startX + 4, yPos)
                yPos += 3.2
            })
        }

        const customerSectionBottom = yPos + 1
        doc.line(startX, customerSectionBottom, startX + contentWidth, customerSectionBottom)

        // ============================================
        // ITEMS TABLE
        // ============================================
        const tableStartY = customerSectionBottom

        const hsnCode = '84313100'
        const gstRate = order.gst_percentage || 18

        // Prepare table data
        const tableData = (order.order_items || []).map((item: any, index: number) => {
            const itemName = item.variant_name
                ? `${item.product_name} - ${item.variant_name}`
                : item.product_name
            const unitPrice = item.unit_price || 0
            const quantity = item.quantity || 0
            const taxableValue = unitPrice * quantity
            const taxAmount = taxableValue * (gstRate / 100)
            const totalAmount = taxableValue + taxAmount

            return [
                (index + 1).toString(),
                itemName,
                hsnCode,
                unitPrice.toFixed(2),
                `${quantity} ${(item.unit || 'QTY').toUpperCase()}`,
                taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                `${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${gstRate}%)`,
                totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ]
        })

        autoTable(doc, {
            startY: tableStartY,
            head: [['#', 'Item', 'HSN/SAC', 'Rate / Item', 'Qty', 'Taxable Value', 'Tax Amount', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: bgLight,
                textColor: textBlack,
                fontStyle: 'bold',
                fontSize: 6,
                halign: 'left',
                cellPadding: 1,
                lineWidth: 0.5,
                lineColor: borderBlack
            },
            bodyStyles: {
                fontSize: 6,
                textColor: textBlack,
                cellPadding: 1,
                lineWidth: 0.5,
                lineColor: borderBlack
            },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },      // #
                1: { cellWidth: 52, halign: 'left', fontStyle: 'bold' },  // Item
                2: { cellWidth: 16, halign: 'center' },     // HSN/SAC
                3: { cellWidth: 18, halign: 'right' },      // Rate
                4: { cellWidth: 16, halign: 'center' },     // Qty
                5: { cellWidth: 23, halign: 'right' },      // Taxable Value
                6: { cellWidth: 28, halign: 'right' },      // Tax Amount
                7: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }  // Amount
            },
            margin: { left: startX, right: margin },
            tableLineWidth: 0.5,
            tableLineColor: borderBlack,
            didDrawPage: (data) => {
                // Draw left border for table
                doc.setDrawColor(...borderBlack)
                doc.setLineWidth(0.5)
                const startY = tableStartY
                const endY = data.cursor?.y ?? (doc as any).lastAutoTable.finalY
                doc.line(startX, startY, startX, endY)
                // Draw right border for table
                doc.line(startX + contentWidth, startY, startX + contentWidth, endY)
            }
        })

        let finalY = (doc as any).lastAutoTable.finalY

        // ============================================
        // TOTALS ROW
        // ============================================
        const totalItems = order.order_items?.length || 0
        const totalQty = (order.order_items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)

        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'normal')

        // Draw border for total items row
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX, finalY + 4)
        doc.line(startX + contentWidth, finalY, startX + contentWidth, finalY + 4)

        finalY += 2.5
        doc.text('TOTAL ITEMS / QTY : ', startX + 2, finalY)
        doc.setFont('helvetica', 'bold')
        doc.text(`${totalItems} / ${totalQty}`, startX + 25, finalY)

        finalY += 1.5
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX + contentWidth, finalY)

        // ============================================
        // SUBTOTALS SECTION (60% left, 40% right per HTML)
        // ============================================
        const leftWidth = startX + (contentWidth * 0.6)
        doc.line(leftWidth, finalY, leftWidth, finalY + 28)  // Vertical divider

        const totalsX = leftWidth + 2
        let totalsY = finalY + 3

        // Calculate totals
        const taxableAmount = order.subtotal_amount || 0
        const cgstRate = gstRate / 2
        const sgstRate = gstRate / 2
        const cgstAmount = taxableAmount * (cgstRate / 100)
        const sgstAmount = taxableAmount * (sgstRate / 100)
        const totalBeforeRound = taxableAmount + cgstAmount + sgstAmount
        const roundedTotal = Math.round(totalBeforeRound)
        const roundOff = roundedTotal - totalBeforeRound

        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'normal')

        // Taxable Amount
        doc.text('Taxable Amount', totalsX, totalsY)
        doc.setFont('helvetica', 'bold')
        doc.text(formatIndianCurrency(taxableAmount), startX + contentWidth - 2, totalsY, { align: 'right' })

        totalsY += 3.5
        doc.setFont('helvetica', 'normal')
        doc.text(`CGST ${cgstRate.toFixed(1)}%`, totalsX, totalsY)
        doc.setFont('helvetica', 'bold')
        doc.text(formatIndianCurrency(cgstAmount), startX + contentWidth - 2, totalsY, { align: 'right' })

        totalsY += 3.5
        doc.setFont('helvetica', 'normal')
        doc.text(`SGST ${sgstRate.toFixed(1)}%`, totalsX, totalsY)
        doc.setFont('helvetica', 'bold')
        doc.text(formatIndianCurrency(sgstAmount), startX + contentWidth - 2, totalsY, { align: 'right' })

        totalsY += 3.5
        doc.setFont('helvetica', 'normal')
        doc.text('Round Off', totalsX, totalsY)
        doc.setFont('helvetica', 'bold')
        doc.text(roundOff.toFixed(2), startX + contentWidth - 2, totalsY, { align: 'right' })

        totalsY += 1
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.2)
        doc.line(totalsX, totalsY, startX + contentWidth - 2, totalsY)

        // Grand Total
        totalsY += 4
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...textBlack)
        doc.text('Total', totalsX, totalsY)
        doc.setTextColor(...primaryBlue)
        doc.text(formatIndianCurrency(roundedTotal), startX + contentWidth - 2, totalsY, { align: 'right' })

        finalY += 28
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX + contentWidth, finalY)

        // ============================================
        // AMOUNT IN WORDS
        // ============================================
        doc.setFillColor(...bgLight)
        doc.rect(startX, finalY, contentWidth, 6, 'F')

        finalY += 3.5
        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'normal')
        const amountInWords = `Total amount (in words): INR ${numberToWords(roundedTotal)} Rupees Only.`
        doc.text(amountInWords, startX + 2, finalY)

        finalY += 2.5
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX + contentWidth, finalY)

        // ============================================
        // HSN/SAC SUMMARY TABLE
        // ============================================
        const totalTaxAmount = cgstAmount + sgstAmount

        autoTable(doc, {
            startY: finalY,
            head: [
                ['HSN/SAC', 'Taxable Value', { content: 'Central Tax', colSpan: 2 }, { content: 'State/UT Tax', colSpan: 2 }, 'Total Tax Amount'],
                ['', '', 'Rate', 'Amount', 'Rate', 'Amount', '']
            ],
            body: [
                [
                    hsnCode,
                    taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    `${cgstRate}%`,
                    cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    `${sgstRate}%`,
                    sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                ],
                [
                    { content: 'TOTAL', styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
                    '',
                    { content: cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
                    '',
                    { content: sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
                    { content: totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }
                ]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: bgLight,
                textColor: textBlack,
                fontStyle: 'bold',
                fontSize: 5.5,
                halign: 'center',
                cellPadding: 1,
                lineWidth: 0.5,
                lineColor: borderBlack
            },
            bodyStyles: {
                fontSize: 5.5,
                textColor: textBlack,
                cellPadding: 1,
                halign: 'center',
                lineWidth: 0.5,
                lineColor: borderBlack
            },
            columnStyles: {
                1: { cellWidth: 25 },
                2: { cellWidth: 15 },
                3: { cellWidth: 20 },
                4: { cellWidth: 15 },
                5: { cellWidth: 20 }
            },
            margin: { left: startX, right: margin },
            tableLineWidth: 0.5,
            tableLineColor: borderBlack
        })

        finalY = (doc as any).lastAutoTable.finalY

        // ============================================
        // AMOUNT PAYABLE
        // ============================================
        doc.setFillColor(...bgLight)
        doc.rect(startX, finalY, contentWidth, 6, 'F')

        doc.setFontSize(7)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text('AMOUNT PAYABLE:', startX + contentWidth - 50, finalY + 3.5)
        doc.setFontSize(8)
        doc.text(formatIndianCurrency(roundedTotal), startX + contentWidth - 2, finalY + 3.5, { align: 'right' })

        finalY += 6
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX + contentWidth, finalY)

        // ============================================
        // BANK DETAILS, QR CODE & SIGNATORY (3 columns)
        // ============================================
        const col1Width = contentWidth / 3
        const col2Width = contentWidth / 3
        const col3Width = contentWidth / 3

        // Vertical dividers
        doc.line(startX + col1Width, finalY, startX + col1Width, finalY + 32)
        doc.line(startX + col1Width + col2Width, finalY, startX + col1Width + col2Width, finalY + 32)

        // Bank Details (Left)
        let bankY = finalY + 4
        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text('Bank Details:', startX + 4, bankY)

        bankY += 4
        doc.setFont('helvetica', 'normal')

        const bankDetails = [
            ['Bank:', 'Karur Vysya Bank'],
            ['Account Holder:', companyName.toUpperCase()],
            ['Account #:', '1754010000000545'],
            ['IFSC Code:', 'KVBL0001754'],
            ['Branch:', 'Padi']
        ]

        bankDetails.forEach(([label, value]) => {
            doc.setTextColor(...textGray)
            doc.setFont('helvetica', 'bold')
            doc.text(label, startX + 4, bankY)
            doc.setTextColor(...textBlack)
            doc.setFont('helvetica', 'normal')
            doc.text(value, startX + 22, bankY)
            bankY += 3.2
        })

        // QR Code (Center)
        if (qrCodeData) {
            const qrSize = 24
            const qrX = startX + col1Width + (col2Width - qrSize) / 2
            const qrY = finalY + 6

            doc.setFontSize(5.5)
            doc.setTextColor(...textBlack)
            doc.setFont('helvetica', 'bold')
            doc.text('PAY USING UPI:', qrX + qrSize / 2, qrY - 1.5, { align: 'center' })

            doc.setDrawColor(200, 200, 200)
            doc.setFillColor(255, 255, 255)
            doc.rect(qrX, qrY, qrSize, qrSize, 'FD')
            doc.addImage(qrCodeData, 'PNG', qrX + 0.5, qrY + 0.5, qrSize - 1, qrSize - 1)
        }

        // Authorized Signatory (Right)
        let sigY = finalY + 4
        doc.setFontSize(6)
        doc.setTextColor(...textBlack)
        doc.setFont('helvetica', 'bold')
        doc.text(`FOR ${companyName.toUpperCase()}`, startX + col1Width + col2Width + col3Width / 2, sigY, { align: 'center' })

        sigY = finalY + 24
        doc.setDrawColor(...textGray)
        doc.setLineWidth(0.3)
        const sigLineWidth = col3Width * 0.65
        const sigLineX = startX + col1Width + col2Width + (col3Width - sigLineWidth) / 2
        doc.line(sigLineX, sigY, sigLineX + sigLineWidth, sigY)

        doc.setFontSize(6)
        doc.setFont('helvetica', 'bold')
        doc.text('Authorized Signatory', startX + col1Width + col2Width + col3Width / 2, sigY + 3, { align: 'center' })

        finalY += 32

        // ============================================
        // BOTTOM BORDER (Close the invoice border)
        // ============================================
        doc.setDrawColor(...borderBlack)
        doc.setLineWidth(0.5)
        doc.line(startX, finalY, startX + contentWidth, finalY)

        // Generate PDF as buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        const filename = `Invoice-${order.order_number || order.id.slice(0, 8)}.pdf`

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('PDF generation error:', error)
        return new NextResponse('Failed to generate invoice', { status: 500 })
    }
}
