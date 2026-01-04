/**
 * Bulk Export Utilities
 * Handles CSV/Excel export for products, categories, orders, and other entities
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ExportOptions {
  format: 'csv' | 'xlsx'
  filename: string
  sheetName?: string
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): Blob {
  const csv = Papa.unparse(data, {
    header: true,
    skipEmptyLines: true,
  })

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Export data to Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export products to file
 */
export async function exportProducts(
  products: any[],
  options: ExportOptions
): Promise<void> {
  // Transform products for export
  const exportData = products.map(product => ({
    Name: product.name,
    Slug: product.slug,
    Description: product.description || '',
    'Short Description': product.short_description || '',
    Category: product.category || '',
    Price: product.price,
    'Compare At Price': product.compare_at_price || '',
    'Stock Quantity': product.stock_quantity,
    SKU: product.sku,
    Weight: product.weight || '',
    Tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    Featured: product.is_featured ? 'Yes' : 'No',
    Status: product.status,
    'Created At': product.created_at,
  }))

  const blob =
    options.format === 'csv'
      ? exportToCSV(exportData, options.filename)
      : exportToExcel(exportData, options.filename, options.sheetName)

  downloadBlob(blob, `${options.filename}.${options.format}`)
}

/**
 * Export categories to file
 */
export async function exportCategories(
  categories: any[],
  options: ExportOptions
): Promise<void> {
  const exportData = categories.map(category => ({
    Name: category.name,
    Slug: category.slug,
    Description: category.description || '',
    'Parent ID': category.parent_id || '',
    'Sort Order': category.sort_order,
    Active: category.is_active ? 'Yes' : 'No',
    'Created At': category.created_at,
  }))

  const blob =
    options.format === 'csv'
      ? exportToCSV(exportData, options.filename)
      : exportToExcel(exportData, options.filename, options.sheetName)

  downloadBlob(blob, `${options.filename}.${options.format}`)
}

/**
 * Export orders to file
 */
export async function exportOrders(
  orders: any[],
  options: ExportOptions
): Promise<void> {
  const exportData = orders.map(order => ({
    'Order Number': order.order_number,
    'Customer Email': order.guest_email || 'N/A',
    Status: order.order_status,
    'Payment Status': order.payment_status,
    'Payment Method': order.payment_method || '',
    Subtotal: order.subtotal,
    Tax: order.tax,
    Shipping: order.shipping_cost,
    Total: order.total_amount,
    'Created At': order.created_at,
    'Paid At': order.paid_at || '',
    'Shipped At': order.shipped_at || '',
  }))

  const blob =
    options.format === 'csv'
      ? exportToCSV(exportData, options.filename)
      : exportToExcel(exportData, options.filename, options.sheetName)

  downloadBlob(blob, `${options.filename}.${options.format}`)
}

/**
 * Export customers to file
 */
export async function exportCustomers(
  customers: any[],
  options: ExportOptions
): Promise<void> {
  const exportData = customers.map(customer => ({
    'User ID': customer.clerk_user_id,
    Email: customer.email || '',
    Name: customer.name || '',
    Role: customer.role,
    Phone: customer.phone || '',
    'Created At': customer.created_at,
  }))

  const blob =
    options.format === 'csv'
      ? exportToCSV(exportData, options.filename)
      : exportToExcel(exportData, options.filename, options.sheetName)

  downloadBlob(blob, `${options.filename}.${options.format}`)
}

/**
 * Generate CSV template for product import
 */
export function generateProductImportTemplate(): string {
  const headers = [
    'name',
    'slug',
    'description',
    'short_description',
    'category',
    'price',
    'compare_at_price',
    'stock_quantity',
    'sku',
    'weight',
    'tags',
    'is_featured',
    'status',
  ]

  const sampleData = [
    {
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'Product description here',
      short_description: 'Short description',
      category: 'Category Name',
      price: '999.00',
      compare_at_price: '1299.00',
      stock_quantity: '50',
      sku: 'SKU-001',
      weight: '2.5',
      tags: 'tag1, tag2, tag3',
      is_featured: 'false',
      status: 'active',
    },
  ]

  return Papa.unparse([...sampleData], { header: true })
}

/**
 * Generate CSV template for category import
 */
export function generateCategoryImportTemplate(): string {
  const sampleData = [
    {
      name: 'Sample Category',
      slug: 'sample-category',
      description: 'Category description',
      parent_slug: '',
      sort_order: '0',
      is_active: 'true',
    },
  ]

  return Papa.unparse([...sampleData], { header: true })
}

