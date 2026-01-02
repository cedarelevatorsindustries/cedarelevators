import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Activity,
    Settings,
    Package,
    FileText,
    User,
    Trash2,
    Edit,
    PlusCircle,
    ShoppingCart,
    LoaderCircle
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export interface ActivityItem {
    id: string
    type: 'order' | 'customer' | 'product' | 'quote'
    title: string
    description: string
    timestamp: string
}

interface RecentActivitiesProps {
    activities: ActivityItem[]
    isLoading?: boolean
}

const entityIcons = {
    product: Package,
    order: ShoppingCart,
    quote: FileText,
    customer: User,
}

const entityColors = {
    product: "text-purple-600 bg-purple-100",
    order: "text-blue-600 bg-blue-100",
    quote: "text-orange-600 bg-orange-100",
    customer: "text-green-600 bg-green-100",
}

export function RecentActivities({ activities, isLoading = false }: RecentActivitiesProps) {
    if (isLoading) {
        return (
            <Card className="border-gray-200 shadow-sm h-full">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                        <LoaderCircle className="w-8 h-8 animate-spin text-orange-600" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (activities.length === 0) {
        return (
            <Card className="border-gray-200 shadow-sm h-full">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No recent activities found.</p>
                        <p className="text-gray-400 text-xs mt-1">Activities will appear here as you work with the system.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Recent Activities
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50" asChild>
                        <Link href="/admin/activity-log">View All</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-gray-100">
                        {activities.map((activity) => {
                            const EntityIcon = entityIcons[activity.type] || Activity

                            return (
                                <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors flex gap-4 group">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${entityColors[activity.type]}`}>
                                        <EntityIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 leading-none mb-1">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                <span className="capitalize">{activity.type}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
