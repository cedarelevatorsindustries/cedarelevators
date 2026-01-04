"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { CustomReactSelect } from "@/components/ui/select"
import { getQuoteChartData, QuoteChartData } from "@/lib/actions/admin-dashboard"
import { LoaderCircle } from "lucide-react"

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
                <div className="flex items-center justify-center h-[350px]">
                    <LoaderCircle className="w-8 h-8 animate-spin text-orange-600" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f4f4f5' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={view === 'monthly' ? undefined : 40} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

