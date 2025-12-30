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
    ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export interface ActivityItem {
    id: string
    action: 'create' | 'update' | 'delete' | 'other'
    entity: 'product' | 'order' | 'quote' | 'settings' | 'category' | 'user'
    description: string
    user: string
    timestamp: string
    details?: string
}

interface RecentActivitiesProps {
    activities: ActivityItem[]
}

const actionIcons = {
    create: PlusCircle,
    update: Edit,
    delete: Trash2,
    other: Activity
}

const entityIcons = {
    product: Package,
    order: ShoppingCart,
    quote: FileText,
    settings: Settings,
    category: Activity,
    user: User
}

const actionColors = {
    create: "text-green-600 bg-green-100",
    update: "text-blue-600 bg-blue-100",
    delete: "text-red-600 bg-red-100",
    other: "text-gray-600 bg-gray-100"
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
    if (activities.length === 0) {
        return (
            <Card className="border-gray-200 shadow-sm h-full">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-sm text-center py-8">No recent activities found.</p>
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
                            const ActionIcon = actionIcons[activity.action] || Activity
                            const EntityIcon = entityIcons[activity.entity] || Activity

                            return (
                                <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors flex gap-4 group">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${actionColors[activity.action]}`}>
                                        <ActionIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-gray-900 leading-none">
                                                {activity.description}
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                <EntityIcon className="h-3 w-3" />
                                                <span className="capitalize">{activity.entity}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="font-medium text-gray-700">{activity.user}</span>
                                            {activity.details && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-gray-400 truncate max-w-[200px]">{activity.details}</span>
                                                </>
                                            )}
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
