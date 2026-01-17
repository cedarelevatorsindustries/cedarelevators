import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/data/orders'
import { auth } from '@clerk/nextjs/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check Clerk authentication first (for regular users)
        const { userId } = await auth()

        // Check admin authentication (for admin panel)
        const adminUser = await getCurrentAdminUser()

        // User must be either authenticated via Clerk OR be an admin
        if (!userId && !adminUser) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params
        const order = await getOrderById(id)

        if (!order) {
            return new NextResponse('Order not found', { status: 404 })
        }

        // Verify ownership - allow if user owns order OR is admin
        if (!adminUser && order.clerk_user_id !== userId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // Get order status display
        const getStatusDisplay = (status: string) => {
            const statusMap: Record<string, string> = {
                'pending': 'Order Placed',
                'processing': 'Processing',
                'shipped': 'Shipped',
                'delivered': 'Delivered',
                'cancelled': 'Cancelled'
            }
            return statusMap[status.toLowerCase()] || 'Order Placed'
        }

        const orderStatus = getStatusDisplay(order.order_status || order.status || 'pending')
        const isCOD = order.payment_method?.toLowerCase() === 'cod'

        // Create PDF
        const doc = new jsPDF()

        // Header
        doc.setFontSize(24)
        doc.setTextColor(249, 115, 22) // Orange
        doc.setFont('helvetica', 'bold')
        doc.text('CEDAR ELEVATORS', 20, 25)

        doc.setFontSize(10)
        doc.setTextColor(102, 102, 102) // Light gray
        doc.setFont('helvetica', 'normal')
        doc.text('Elevator Solutions', 20, 32)

        // Invoice Number and Status (Right side)
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.text('INVOICE', 190, 20, { align: 'right' })

        doc.setFontSize(18)
        doc.setTextColor(51, 51, 51) // Dark gray
        doc.setFont('helvetica', 'bold')
        doc.text(order.order_number || '', 190, 28, { align: 'right' })

        // Status Badge
        if (order.order_status === 'cancelled') {
            doc.setFillColor(239, 68, 68) // Red
        } else {
            doc.setFillColor(16, 185, 129) // Green
        }
        const statusText = orderStatus.toUpperCase()
        const statusWidth = doc.getTextWidth(statusText) + 8
        doc.roundedRect(190 - statusWidth, 32, statusWidth, 7, 2, 2, 'F')
        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text(statusText, 190 - statusWidth / 2, 36.5, { align: 'center' })

        // Date
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.setFont('helvetica', 'normal')
        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
        doc.text(`Date: ${orderDate}`, 190, 44, { align: 'right' })

        // Divider line
        doc.setLineWidth(2)
        doc.setDrawColor(249, 115, 22) // Orange
        doc.line(20, 50, 190, 50)

        // Addresses Section
        let yPos = 60

        // Bill To
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102) // Light gray
        doc.setFont('helvetica', 'bold')
        doc.text('BILL TO', 20, yPos)

        yPos += 6
        doc.setFontSize(10)
        doc.setTextColor(51, 51, 51) // Dark gray
        if (order.billing_address && Object.keys(order.billing_address).length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.text(order.billing_address.name || 'Customer', 20, yPos)
            yPos += 5
            doc.setFont('helvetica', 'normal')
            if (order.billing_address.address_line1) {
                doc.text(order.billing_address.address_line1, 20, yPos)
                yPos += 5
            }
            if (order.billing_address.address_line2) {
                doc.text(order.billing_address.address_line2, 20, yPos)
                yPos += 5
            }
            if (order.billing_address.city || order.billing_address.state) {
                doc.text(`${order.billing_address.city || ''}, ${order.billing_address.state || ''}`, 20, yPos)
                yPos += 5
            }
            if (order.billing_address.postal_code || order.billing_address.pincode) {
                doc.text(order.billing_address.postal_code || order.billing_address.pincode || '', 20, yPos)
                yPos += 5
            }
            if (order.billing_address.phone) {
                doc.text(`Phone: ${order.billing_address.phone}`, 20, yPos)
                yPos += 5
            }
            if (order.billing_address.gstin) {
                doc.setFontSize(9)
                doc.setTextColor(102, 102, 102)
                doc.text(`GSTIN: ${order.billing_address.gstin}`, 20, yPos)
            }
        } else {
            doc.text('No billing address provided', 20, yPos)
        }

        // Ship To
        yPos = 60
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.setFont('helvetica', 'bold')
        doc.text('SHIP TO', 110, yPos)

        yPos += 6
        doc.setFontSize(10)
        doc.setTextColor(51, 51, 51)
        if (order.shipping_method === 'pickup') {
            doc.setFont('helvetica', 'bold')
            doc.text('In-Store Pickup', 110, yPos)
            yPos += 5
            doc.setFont('helvetica', 'normal')
            doc.text('Customer will collect from store location', 110, yPos)
        } else if (order.shipping_address && Object.keys(order.shipping_address).length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.text(order.shipping_address.name || 'Customer', 110, yPos)
            yPos += 5
            doc.setFont('helvetica', 'normal')
            if (order.shipping_address.address_line1) {
                doc.text(order.shipping_address.address_line1, 110, yPos)
                yPos += 5
            }
            if (order.shipping_address.address_line2) {
                doc.text(order.shipping_address.address_line2, 110, yPos)
                yPos += 5
            }
            if (order.shipping_address.city || order.shipping_address.state) {
                doc.text(`${order.shipping_address.city || ''}, ${order.shipping_address.state || ''}`, 110, yPos)
                yPos += 5
            }
            if (order.shipping_address.postal_code || order.shipping_address.pincode) {
                doc.text(order.shipping_address.postal_code || order.shipping_address.pincode || '', 110, yPos)
                yPos += 5
            }
            if (order.shipping_address.phone) {
                doc.text(`Phone: ${order.shipping_address.phone}`, 110, yPos)
            }
        } else {
            doc.text('No shipping address provided', 110, yPos)
        }

        // Order Items Table
        yPos = 130
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.setFont('helvetica', 'bold')
        doc.text('ORDER ITEMS', 20, yPos)

        yPos += 5

        // Prepare table data - format properly without line breaks
        const tableData = (order.order_items || []).map((item: any) => {
            const itemName = item.variant_name
                ? `${item.product_name} - ${item.variant_name}`
                : item.product_name
            return [
                itemName,
                item.quantity.toString(),
                `Rs.${Math.round(item.unit_price)}`,
                `Rs.${Math.round(item.unit_price * item.quantity)}`
            ]
        })

        autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Qty', 'Unit Price', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [243, 244, 246],
                textColor: [102, 102, 102],
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [51, 51, 51]
            },
            columnStyles: {
                0: { cellWidth: 80, halign: 'left' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 40, halign: 'right' },
                3: { cellWidth: 40, halign: 'right' }
            },
            margin: { left: 20, right: 20 }
        })

        // Get final Y position after table
        const finalY = (doc as any).lastAutoTable.finalY + 10

        // Totals
        const totalsX = 120
        let totalsY = finalY

        doc.setFontSize(10)
        doc.setTextColor(51, 51, 51)
        doc.setFont('helvetica', 'bold')

        // Subtotal
        doc.text('Subtotal', totalsX, totalsY)
        doc.setFont('helvetica', 'normal')
        doc.text(`Rs.${Math.round(order.subtotal_amount || 0)}`, 190, totalsY, { align: 'right' })

        totalsY += 6

        // Tax
        doc.setFont('helvetica', 'bold')
        doc.text(`Tax (GST ${order.gst_percentage || 18}%)`, totalsX, totalsY)
        doc.setFont('helvetica', 'normal')
        doc.text(`Rs.${Math.round(order.tax_amount || 0)}`, 190, totalsY, { align: 'right' })

        totalsY += 6

        // Shipping
        doc.setFont('helvetica', 'bold')
        doc.text('Shipping', totalsX, totalsY)
        doc.setFont('helvetica', 'normal')
        const shippingText = order.shipping_amount > 0
            ? `Rs.${Math.round(order.shipping_amount)}`
            : 'Paid on delivery'
        doc.text(shippingText, 190, totalsY, { align: 'right' })

        totalsY += 8

        // Grand Total
        doc.setFontSize(13)
        doc.setTextColor(249, 115, 22) // Orange
        doc.setFont('helvetica', 'bold')
        doc.text('GRAND TOTAL', totalsX, totalsY)
        doc.text(`Rs.${Math.round(order.total_amount || 0)}`, 190, totalsY, { align: 'right' })

        // Payment Info
        totalsY += 15
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.setFont('helvetica', 'bold')
        doc.text('Payment Method', 20, totalsY)
        doc.text('Payment Status', 110, totalsY)

        totalsY += 5
        doc.setFontSize(10)
        doc.setTextColor(51, 51, 51)
        doc.setFont('helvetica', 'normal')
        doc.text(isCOD ? 'Cash on Delivery (COD)' : 'Prepaid / Online', 20, totalsY)
        doc.text((order.payment_status || 'Pending').charAt(0).toUpperCase() + (order.payment_status || 'Pending').slice(1), 110, totalsY)

        // Footer
        const pageHeight = doc.internal.pageSize.height
        doc.setLineWidth(0.5)
        doc.setDrawColor(229, 231, 235)
        doc.line(20, pageHeight - 30, 190, pageHeight - 30)

        doc.setFontSize(10)
        doc.setTextColor(51, 51, 51)
        doc.setFont('helvetica', 'bold')
        doc.text('CEDAR ELEVATORS - Elevator Solutions', 105, pageHeight - 22, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.text('Thank you for your business!', 105, pageHeight - 16, { align: 'center' })

        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.text('This is a computer-generated invoice and does not require a signature.', 105, pageHeight - 10, { align: 'center' })

        // Generate PDF as buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

        // Create filename: Invoice-OrderNumber.pdf
        const filename = `Invoice-${order.order_number || order.id.slice(0, 8)}.pdf`

        // Return PDF as download
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
