"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { CustomReactSelect } from "@/components/ui/select"
import { getQuoteChartData, QuoteChartData } from "@/lib/actions/admin-dashboard"
import { LoaderCircle } from "lucide-react"
import { ChartTooltip } from "@/components/admin/dashboard/chart-tooltip"

export function QuotationChart() {
    const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>("monthly")
    const [data, setData] = useState<QuoteChartData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const options = [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" }
    ]

    useEffect(() => {
        loadData()
    }, [view])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const chartData = await getQuoteChartData(view)
            setData(chartData)
        } catch (error) {
            console.error('Error loading chart data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div></div>
                <div className="w-[120px]">
                    <CustomReactSelect
                        value={options.find(o => o.value === view)}
                        onChange={(opt: any) => setView(opt?.value || "monthly")}
                        options={options}
                        isSearchable={false}
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-[320px]">
                    <LoaderCircle className="w-6 h-6 animate-spin text-[#E85A24]" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E2" />
                        <XAxis
                            dataKey="name"
                            stroke="#A09B94"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#A09B94"
                            fontSize={11}
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            content={<ChartTooltip suffix=" quotes" />}
                            cursor={{ fill: '#F9F8F5' }}
                        />
                        <Bar
                            dataKey="count"
                            name="Quotations"
                            fill="#E85A24"
                            radius={[6, 6, 0, 0]}
                            barSize={view === 'monthly' ? undefined : 36}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
