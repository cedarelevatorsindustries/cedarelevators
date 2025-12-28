/**
 * Bulk Operations Page
 * Admin interface for importing/exporting data
 */

'use client'

import { useState } from 'react'
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { parseCSV, parseExcel, validateProductRow, transformProductRow } from '@/lib/admin/bulk-import'
import { exportProducts, exportCategories, exportOrders, exportCustomers, downloadBlob } from '@/lib/admin/bulk-export'

export default function BulkOperationsPage() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)

  // Handle product import
  const handleProductImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResults(null)

    try {
      // Parse file
      const { data, errors: parseErrors } = file.name.endsWith('.csv')
        ? await parseCSV(file)
        : await parseExcel(file)

      if (parseErrors.length > 0) {
        toast.error(`Parse errors: ${parseErrors.length}`)
        setImportResults({ errors: parseErrors })
        return
      }

      // Validate rows
      const validationErrors: any[] = []
      const validProducts: any[] = []

      data.forEach((row: any, index: number) => {
        const rowErrors = validateProductRow(row, index + 1)
        if (rowErrors.length > 0) {
          validationErrors.push(...rowErrors)
        } else {
          validProducts.push(transformProductRow(row))
        }
      })

      if (validationErrors.length > 0) {
        toast.error(`Validation errors: ${validationErrors.length}`)
        setImportResults({
          totalRows: data.length,
          successfulRows: validProducts.length,
          failedRows: validationErrors.length,
          errors: validationErrors,
        })
        return
      }

      // Import to database
      const response = await fetch('/api/admin/import/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validProducts }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Imported ${result.count} products successfully`)
        setImportResults({
          totalRows: data.length,
          successfulRows: result.count,
          failedRows: 0,
          errors: [],
        })
      } else {
        toast.error('Import failed: ' + result.error)
      }
    } catch (error: any) {
      toast.error('Import error: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  // Handle product export
  const handleProductExport = async (format: 'csv' | 'xlsx') => {
    setExporting(true)

    try {
      const response = await fetch('/api/admin/export/products')
      const result = await response.json()

      if (result.success && result.products) {
        await exportProducts(result.products, {
          format,
          filename: `products-export-${Date.now()}`,
          sheetName: 'Products',
        })
        toast.success('Export completed')
      } else {
        toast.error('Export failed')
      }
    } catch (error: any) {
      toast.error('Export error: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  // Download CSV template
  const downloadTemplate = async (type: 'products' | 'categories') => {
    try {
      const response = await fetch(`/api/admin/templates/${type}`)
      const blob = await response.blob()
      downloadBlob(blob, `${type}-template.csv`)
      toast.success('Template downloaded')
    } catch (error: any) {
      toast.error('Failed to download template')
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Bulk Operations</h1>
        <p className="text-muted-foreground mt-2">
          Import and export data in bulk
        </p>
      </div>

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Import Data</h2>
        </div>

        <div className="space-y-4">
          {/* Product Import */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Import Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload CSV or Excel file with product data
            </p>
            <div className="flex gap-2">
              <label htmlFor="product-import">
                <Button disabled={importing} asChild>
                  <span>
                    {importing ? 'Importing...' : 'Choose File'}
                  </span>
                </Button>
              </label>
              <input
                id="product-import"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleProductImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => downloadTemplate('products')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5" />
                <h4 className="font-medium">Import Results</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p>Total Rows: {importResults.totalRows}</p>
                <p className="text-green-600">Successful: {importResults.successfulRows}</p>
                <p className="text-red-600">Failed: {importResults.failedRows}</p>
              </div>
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <p className="font-medium text-sm mb-1">Errors:</p>
                  {importResults.errors.slice(0, 10).map((error: any, idx: number) => (
                    <p key={idx} className="text-xs text-red-600">
                      Row {error.row}: {error.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Export Data</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Products Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Export Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download all products data
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleProductExport('csv')}
                disabled={exporting}
                size="sm"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => handleProductExport('xlsx')}
                disabled={exporting}
                size="sm"
                variant="outline"
              >
                Export Excel
              </Button>
            </div>
          </div>

          {/* Orders Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Export Orders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download orders history
            </p>
            <div className="flex gap-2">
              <Button size="sm" disabled>Export CSV</Button>
              <Button size="sm" variant="outline" disabled>Export Excel</Button>
            </div>
          </div>

          {/* Categories Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Export Categories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download category data
            </p>
            <div className="flex gap-2">
              <Button size="sm" disabled>Export CSV</Button>
              <Button size="sm" variant="outline" disabled>Export Excel</Button>
            </div>
          </div>

          {/* Customers Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Export Customers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download customer list
            </p>
            <div className="flex gap-2">
              <Button size="sm" disabled>Export CSV</Button>
              <Button size="sm" variant="outline" disabled>Export Excel</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
