"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const dailyData = [
    { name: "Mon", count: 12 },
    { name: "Tue", count: 18 },
    { name: "Wed", count: 15 },
    { name: "Thu", count: 22 },
    { name: "Fri", count: 25 },
    { name: "Sat", count: 18 },
    { name: "Sun", count: 10 },
]

const weeklyData = [
    { name: "Week 1", count: 85 },
    { name: "Week 2", count: 92 },
    { name: "Week 3", count: 78 },
    { name: "Week 4", count: 95 },
]

const monthlyData = [
    { name: "Jan", count: 145 },
    { name: "Feb", count: 168 },
    { name: "Mar", count: 180 },
    { name: "Apr", count: 195 },
    { name: "May", count: 210 },
    { name: "Jun", count: 185 },
    { name: "Jul", count: 225 },
    { name: "Aug", count: 240 },
    { name: "Sep", count: 215 },
    { name: "Oct", count: 260 },
    { name: "Nov", count: 280 },
    { name: "Dec", count: 250 },
]

export function QuotationChart() {
    const [view, setView] = useState("monthly")

    const getData = () => {
        if (view === "daily") return dailyData
        if (view === "weekly") return weeklyData
        return monthlyData
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    {/* Optional: Add legend or subtitle if needed */}
                </div>
                <Select value={view} onValueChange={setView}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getData()}>
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
        </div>
    )
}
