/**
 * Reports Dashboard Page
 * Custom report generation interface
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { REPORT_TEMPLATES } from '@/lib/reports/generator'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const generateReport = async (type: string, format: 'pdf' | 'xlsx') => {
    setGenerating(true)

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report generated successfully')
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error: any) {
      toast.error('Report generation error: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Custom Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and download business reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
          <Card key={key} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => generateReport(template.type, 'pdf')}
                    disabled={generating}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => generateReport(template.type, 'xlsx')}
                    disabled={generating}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Scheduled Reports Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Scheduled Reports</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Configure automatic report generation and email delivery
        </p>
        <Button variant="outline" disabled>
          Coming Soon
        </Button>
      </Card>
    </div>
  )
}

