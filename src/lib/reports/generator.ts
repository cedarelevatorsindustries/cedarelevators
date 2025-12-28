/**
 * Report Generator Service
 * Generates custom reports in various formats
 */

import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { calculateSalesMetrics, calculateProductMetrics, calculateCustomerMetrics } from '@/lib/analytics/calculations'

export interface ReportConfig {
  type: 'sales' | 'inventory' | 'customer' | 'orders'
  format: 'pdf' | 'xlsx' | 'csv'
  dateRange: {
    start: Date
    end: Date
  }
  filters?: any
}

/**
 * Generate Sales Report
 */
export async function generateSalesReport(
  config: ReportConfig
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const { start, end } = config.dateRange
    const metrics = await calculateSalesMetrics(start, end)

    const reportData = {
      'Report Type': 'Sales Summary',
      'Date Range': `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      'Total Revenue': `₹${metrics.totalRevenue.toLocaleString()}`,
      'Total Orders': metrics.totalOrders,
      'Average Order Value': `₹${metrics.averageOrderValue.toFixed(2)}`,
      'Revenue Change': `${metrics.revenueChange.toFixed(2)}%`,
      'Orders Change': `${metrics.ordersChange.toFixed(2)}%`,
    }

    if (config.format === 'pdf') {
      return generatePDFReport('Sales Report', reportData)
    } else {
      return generateExcelReport('Sales Report', [reportData])
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Generate Inventory Report
 */
export async function generateInventoryReport(
  config: ReportConfig
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const metrics = await calculateProductMetrics()

    const reportData = {
      'Report Type': 'Inventory Status',
      'Generated On': new Date().toLocaleString(),
      'Total Products': metrics.totalProducts,
      'Active Products': metrics.activeProducts,
      'Low Stock Products': metrics.lowStockProducts,
      'Out of Stock Products': metrics.outOfStockProducts,
    }

    if (config.format === 'pdf') {
      return generatePDFReport('Inventory Report', reportData)
    } else {
      return generateExcelReport('Inventory Report', [reportData])
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Generate Customer Report
 */
export async function generateCustomerReport(
  config: ReportConfig
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const { start, end } = config.dateRange
    const metrics = await calculateCustomerMetrics(start, end)

    const reportData = {
      'Report Type': 'Customer Analytics',
      'Date Range': `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      'Total Customers': metrics.totalCustomers,
      'New Customers': metrics.newCustomers,
      'Repeat Customers': metrics.repeatCustomers,
      'Retention Rate': `${metrics.customerRetentionRate.toFixed(2)}%`,
      'Business Customers': metrics.businessVsIndividual.business,
      'Individual Customers': metrics.businessVsIndividual.individual,
    }

    if (config.format === 'pdf') {
      return generatePDFReport('Customer Report', reportData)
    } else {
      return generateExcelReport('Customer Report', [reportData])
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Generate PDF Report
 */
function generatePDFReport(
  title: string,
  data: Record<string, any>
): { success: boolean; data: Blob } {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text(title, 20, 20)
  
  // Metadata
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
  
  // Data
  doc.setFontSize(12)
  let yPos = 45
  
  Object.entries(data).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 20, yPos)
    yPos += 10
  })

  const blob = doc.output('blob')
  return { success: true, data: blob }
}

/**
 * Generate Excel Report
 */
function generateExcelReport(
  title: string,
  data: any[]
): { success: boolean; data: Blob } {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, title)

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  return { success: true, data: blob }
}

/**
 * Report Templates
 */
export const REPORT_TEMPLATES = {
  SALES_SUMMARY: {
    type: 'sales' as const,
    name: 'Sales Summary',
    description: 'Overview of sales performance',
  },
  INVENTORY_STATUS: {
    type: 'inventory' as const,
    name: 'Inventory Status',
    description: 'Current inventory levels and alerts',
  },
  CUSTOMER_ACTIVITY: {
    type: 'customer' as const,
    name: 'Customer Activity',
    description: 'Customer acquisition and retention metrics',
  },
  ORDER_FULFILLMENT: {
    type: 'orders' as const,
    name: 'Order Fulfillment',
    description: 'Order processing and delivery metrics',
  },
}
