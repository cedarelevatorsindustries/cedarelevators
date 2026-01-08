'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  ArrowLeft, Upload, Download, LoaderCircle, CircleCheck, XCircle,
  AlertTriangle, FileWarning, FileText, CheckCircle2, Info
} from 'lucide-react'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { PreviewResult, ProductGroup, ImportResult, ValidationError, ProductVariant, ImportError } from '@/types/csv-import.types'

type Step = 'upload' | 'review' | 'importing' | 'results'

export default function ProductImportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewResult | null>(null)
  const [importResults, setImportResults] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setPreviewData(null)
      setImportResults(null)
      setCurrentStep('upload')
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('[Client] Sending preview request...')
      const response = await fetch('/api/admin/products/import/preview', {
        method: 'POST',
        body: formData,
      })

      console.log('[Client] Response status:', response.status)
      console.log('[Client] Response headers:', Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('[Client] Non-JSON response received:', textResponse.substring(0, 500))
        console.error('[Client] Full response length:', textResponse.length)

          // Save full response to window for inspection
          ; (window as any).lastErrorResponse = textResponse
        console.log('[Client] Full error saved to window.lastErrorResponse - inspect it in console!')

        // Try to extract error message from HTML
        const errorMatch = textResponse.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)
        if (errorMatch) {
          console.error('[Client] Extracted error:', errorMatch[1].substring(0, 1000))
        }

        toast.error('Server error - check console for details')
        return
      }

      const data: PreviewResult = await response.json()
      console.log('[Client] JSON data received:', data)

      if (data.success) {
        setPreviewData(data)
        setCurrentStep('review')
        toast.success(`Validation complete: ${data.totalProducts} products, ${data.totalVariants} variants`)
      } else {
        toast.error(data.blockingErrors?.[0]?.message || 'Failed to preview import')
      }
    } catch (error) {
      console.error('[Client] Error previewing import:', error)
      console.error('[Client] Error stack:', error instanceof Error ? error.stack : 'No stack')
      toast.error('Failed to preview import. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!previewData?.productGroups) {
      toast.error('No data to import')
      return
    }

    setLoading(true)
    setCurrentStep('importing')
    setImportProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const response = await fetch('/api/admin/products/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productGroups: previewData.productGroups }),
      })

      const data: ImportResult = await response.json()

      clearInterval(progressInterval)
      setImportProgress(100)

      setTimeout(() => {
        setImportResults(data)
        setCurrentStep('results')

        if (data.success) {
          toast.success(`Import completed successfully!`)
        } else {
          toast.error(`Import completed with ${data.errors?.length || 0} errors`)
        }
      }, 500)

    } catch (error) {
      clearInterval(progressInterval)
      console.error('Error importing products:', error)
      toast.error('Failed to import products')
      setCurrentStep('review')
    } finally {
      setLoading(false)
    }
  }


  const downloadTemplate = () => {
    const headers = [
      'title',
      'description',
      'short_description',
      'image',
      'base_price',
      'compare_price',
      'cost_per_item',
      'stock_quantity',
      'low_stock_threshold',
      'allow_backorder',
      'applications',
      'categories',
      'subcategories',
      'types',
      'collections',
      'attributes',
      'tags',
      'variant_title',
      'variant_option_1',
      'variant_option_1_value',
      'variant_option_2',
      'variant_option_2_value',
      'variant_price',
      'variant_stock',
      'status'
    ].join(',')

    const sampleData = [
      // Product 1: Simple product (no variants)
      [
        'Gearless Traction Motor',
        'High-efficiency permanent magnet synchronous motor for modern elevator systems. Features whisper-quiet operation and energy savings up to 40%.',
        'PMSM motor with energy savings',
        '', // image
        '45000',
        '55000',
        '32000',
        '25',
        '5',
        'FALSE',
        '"traction, service"',
        'motors',
        'traction motors',
        'industrial elevators',
        '"trending this months, new drops"',
        `"${JSON.stringify({
          rated_load_capacity: "1000 kg",
          rated_speed: "1.75 m/s",
          motor_power_rating: "11 kW",
          traction_sheave_diameter: "400 mm"
        }).replace(/"/g, '""')}"`, // Escape quotes for CSV
        '"PMSM, Gearless, High Efficiency, Traction Machine, Lift Motor"',
        'Gearless Motor 1.0 m/s / 320 mm',
        'Rated Speed',
        '1.0 m/s',
        'Sheave Diameter',
        '320 mm',
        '45000',
        '20',
        'active'
      ].join(','),

      // Product 2: Variable product (Row 1 - Hairline SS Blue LED)
      [
        'Designer COP Panel',
        'Premium stainless steel car operating panel with tactile buttons and LED indicators. Modern design complements any elevator interior.',
        'Premium COP with LED display',
        '',
        '15000',
        '18000',
        '10000',
        '50',
        '10',
        'FALSE',
        '"modernization, testing"',
        'pannels',
        'Accessories',
        'hospital lifts',
        'best sellers',
        `"${JSON.stringify({
          faceplate_finish: "Mirror Etched Stainless Steel",
          display_interface: "7-inch TFT Color LCD"
        }).replace(/"/g, '""')}"`,
        '"LCD Display, Stainless Steel, Elevator Fixture"',
        'COP Hairline SS - Blue LED',
        'Faceplate Finish',
        'Hairline Stainless Steel',
        'Button LED Color',
        'Blue',
        '15000',
        '20',
        'active'
      ].join(','),

      // Product 2: Variable product (Row 2 - Green LED, same product)
      [
        'Designer COP Panel',
        'Premium stainless steel car operating panel with tactile buttons and LED indicators. Modern design complements any elevator interior.',
        'Premium COP with LED display',
        '',
        '15000',
        '18000',
        '10000',
        '50',
        '10',
        'FALSE',
        '"modernization, testing"',
        'pannels',
        'Accessories',
        'hospital lifts',
        'best sellers',
        `"${JSON.stringify({
          faceplate_finish: "Mirror Etched Stainless Steel",
          display_interface: "7-inch TFT Color LCD"
        }).replace(/"/g, '""')}"`,
        '"LCD Display, Stainless Steel, Elevator Fixture"',
        'COP Hairline SS - Green LED',
        'Faceplate Finish',
        'Hairline Stainless Steel',
        'Button LED Color',
        'green',
        '15000',
        '20',
        'active'
      ].join(',')
    ].join('\n')

    const csvContent = `${headers}\n${sampleData}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }



  const downloadErrorReport = () => {
    if (!importResults?.errors) return

    const errorsCsv = [
      ['Product Title', 'Variant SKU', 'Error Message', 'Details'],
      ...importResults.errors.map((err: ImportError) => [
        err.productTitle,
        err.variantSku || '',
        err.message,
        err.details || '',
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([errorsCsv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'import-errors.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Error report downloaded')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Import Products</h1>
            <p className="text-gray-600 mt-1">Import products and variants from CSV file</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep === 'upload' ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'
              }`}>
              {currentStep === 'upload' ? '1' : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <span className={`font-medium ${currentStep === 'upload' ? 'text-orange-600' : 'text-gray-600'}`}>
              Upload
            </span>
          </div>

          <div className="w-24 h-0.5 bg-gray-300"></div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep === 'review' || currentStep === 'importing' ? 'bg-orange-600 text-white' :
              currentStep === 'results' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {currentStep === 'results' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className={`font-medium ${currentStep === 'review' || currentStep === 'importing' ? 'text-orange-600' : 'text-gray-600'}`}>
              Review
            </span>
          </div>

          <div className="w-24 h-0.5 bg-gray-300"></div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep === 'results' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              3
            </div>
            <span className={`font-medium ${currentStep === 'results' ? 'text-orange-600' : 'text-gray-600'}`}>
              Results
            </span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          Drag & drop your CSV file here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or <span className="text-orange-600 font-medium">choose file</span> to upload
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* File Info */}
                {file && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{file.name}</p>
                      <p className="text-sm text-blue-700">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full space-y-4">
                  {/* Important Info */}
                  <AccordionItem value="important" className="border-none">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-orange-100/50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-orange-900">IMPORTANT - BEFORE YOU IMPORT</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1">
                        <p className="text-sm text-orange-800 mb-3 ml-8">CSV will NOT create catalog entities. Create these in admin first:</p>
                        <ul className="text-sm text-orange-800 space-y-1.5 ml-8">
                          <li>✓ All applications (using exact names)</li>
                          <li>✓ All categories (using exact names)</li>
                          <li>✓ All subcategories (using exact names)</li>
                          <li>✓ All elevator types (using exact names)</li>
                          <li>✓ Collections (optional)</li>
                          <li className="text-orange-900 font-semibold mt-2">⚠️ Names must match EXACTLY (case-insensitive)</li>
                        </ul>
                      </AccordionContent>
                    </div>
                  </AccordionItem>

                  {/* How It Works */}
                  <AccordionItem value="how-it-works" className="border-none">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-blue-100/50">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">HOW THIS IMPORT WORKS</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1">
                        <ul className="text-sm text-blue-800 space-y-1.5 ml-8">
                          <li><strong>✓ Use NAMES, not slugs</strong></li>
                          <li>• One row = one variant (same title = same product)</li>
                          <li>• <strong>Auto-generated</strong>: SKUs, Slugs, SEO metadata</li>
                          <li>• <strong>Name resolution</strong>: Comma-separated ("Motors, Controllers")</li>
                          <li>• <strong>Attributes</strong>: key=value;key=value format</li>
                          <li>• Variant data inherits from product if empty</li>
                          <li>• Missing classifications → saved as Draft with warning</li>
                        </ul>
                      </AccordionContent>
                    </div>
                  </AccordionItem>

                  {/* Required Columns */}
                  <AccordionItem value="required-columns" className="border-none">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100/50">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">Required Columns</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1">
                        <div className="grid grid-cols-2 gap-3 text-sm ml-1">
                          <div>
                            <span className="font-medium text-gray-900">title</span>
                            <p className="text-gray-600">Product name</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">description</span>
                            <p className="text-gray-600">Full description</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">base_price</span>
                            <p className="text-gray-600">Selling price (₹)</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">stock_quantity</span>
                            <p className="text-gray-600">Available stock</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">applications</span>
                            <p className="text-gray-600">Comma-separated names</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">categories</span>
                            <p className="text-gray-600">Comma-separated names</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">attributes</span>
                            <p className="text-gray-600">key=value;key=value</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">variant_option_1</span>
                            <p className="text-gray-600">Option name (optional)</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </Accordion>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <Button
                    onClick={handlePreview}
                    disabled={!file || loading}
                    className="bg-orange-600 hover:bg-orange-700 px-8"
                  >
                    {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Validate & Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Review & Validate */}
        {currentStep === 'review' && previewData && (
          <div className="space-y-6">
            {/* Validation Report Header */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Report</CardTitle>
                <CardDescription>
                  File: {file?.name} • {previewData.totalProducts} products • {previewData.totalVariants} variants
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Detected</p>
                      <p className="text-2xl font-bold text-gray-900">{previewData.totalProducts}</p>
                      <p className="text-xs text-gray-500">{previewData.totalVariants} variants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={previewData.blockingErrors.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${previewData.blockingErrors.length > 0 ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                      {previewData.blockingErrors.length > 0 ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blocking Errors</p>
                      <p className={`text-2xl font-bold ${previewData.blockingErrors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {previewData.blockingErrors.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Warnings (Non-fatal)</p>
                      <p className="text-2xl font-bold text-yellow-600">{previewData.warnings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blocking Errors */}
            {previewData.blockingErrors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    ❌ Errors (Blocking) - {previewData.blockingErrors.length}
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    Fix these errors in your CSV and re-upload to proceed
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previewData.blockingErrors.map((error: ValidationError, index: number) => (
                      <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                            Row {error.row}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{error.field}</p>
                            <p className="text-sm text-red-700">{error.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {previewData.warnings.length > 0 && (
              <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="text-yellow-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ Warnings (Will Not Block) - {previewData.warnings.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {previewData.warnings.slice(0, 5).map((warning: ValidationError, index: number) => (
                      <div key={index} className="bg-white border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                            Row {warning.row}
                          </span>
                          <p className="text-sm text-yellow-800">{warning.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview (First 10 Rows)</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      Warning
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">PRODUCT TITLE</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">CATEGORY</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">PRICE (₹)</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.productGroups.slice(0, 10).map((group: ProductGroup, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">Auto-generated</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{group.title}</td>
                          <td className="px-4 py-3 text-gray-600">{group.category_slug}</td>
                          <td className="px-4 py-3 text-gray-900">₹{group.price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${group.status === 'active' ? 'bg-green-100 text-green-800' :
                              group.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {group.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.productGroups.length > 10 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    ... and {previewData.productGroups.length - 10} more rows
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('upload')
                  setPreviewData(null)
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Fix CSV & Re-upload
              </Button>
              <Button
                onClick={handleImport}
                disabled={previewData.blockingErrors.length > 0}
                className="bg-orange-600 hover:bg-orange-700 px-8"
              >
                Import Products
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Importing (Progress) */}
        {currentStep === 'importing' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <LoaderCircle className="w-8 h-8 text-orange-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Importing Products...</h3>
                    <p className="text-gray-600">Please wait while we process your CSV file</p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-sm font-medium text-orange-600">{Math.round(importProgress)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 'results' && importResults && (
          <div className="space-y-6">
            {/* Success Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Import Completed</h2>
                    <p className="text-green-700 mt-1">Your CSV file has been processed successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className={`grid gap-4 ${importResults.productsUpdated > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Products Created</p>
                      <p className="text-2xl font-bold text-green-900">{importResults.productsCreated}</p>
                      <p className="text-xs text-green-600">New items added to catalog</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {importResults.productsUpdated > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Products Updated</p>
                        <p className="text-2xl font-bold text-blue-900">{importResults.productsUpdated}</p>
                        <p className="text-xs text-blue-600">Existing items refreshed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {importResults.failed > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-700">Saved as Draft</p>
                        <p className="text-2xl font-bold text-yellow-900">{importResults.failed}</p>
                        <p className="text-xs text-yellow-600">Due to missing catalog references or invalid data</p>
                        <Button variant="link" className="text-yellow-700 p-0 h-auto text-xs mt-1">
                          Review Drafts →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* What You Can Do Next */}
            <Card>
              <CardHeader>
                <CardTitle>WHAT YOU CAN DO NEXT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/admin/products">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <FileText className="mr-2 h-4 w-4" />
                      View All Products
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Import Another CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500">
              ℹ️ Need support? You can edit the import from the <Link href="/admin/products" className="text-orange-600 hover:underline">product table</Link> page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
