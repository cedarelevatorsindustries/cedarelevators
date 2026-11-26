import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Activity,
    Package,
    FileText,
    User,
    ShoppingCart,
    ArrowRight
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

const entityInlineStyles: Record<ActivityItem["type"], { backgroundColor: string; borderColor: string; color: string }> = {
    product: { backgroundColor: "#F9F8F5", borderColor: "#EAE8E2", color: "#77736D" },
    order: { backgroundColor: "#F9F8F5", borderColor: "#EAE8E2", color: "#4D6F8F" },
    quote: { backgroundColor: "#FFF0E8", borderColor: "#F5D5C3", color: "#E85A24" },
    customer: { backgroundColor: "#F9F8F5", borderColor: "#EAE8E2", color: "#238A62" },
}

export function RecentActivities({ activities, isLoading = false }: RecentActivitiesProps) {
    return (
        <section className="cedar-admin-card flex h-full flex-col">
            <div className="cedar-admin-card-header flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <div>
                    <h3
                        className="text-[17px] font-semibold tracking-tight"
                        style={{ color: "#171717" }}
                    >
                        Recent Activity
                    </h3>
                    <p className="mt-0.5 text-[12.5px]" style={{ color: "#77736D" }}>
                        Latest administrative actions and system events.
                    </p>
                </div>
                <Link href="/admin/activity-log" className="cedar-admin-btn-subtle shrink-0">
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: "#77736D" }} />
                </Link>
            </div>

            {isLoading ? (
                <div className="cedar-admin-divided px-5 sm:px-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-3 py-3.5">
                            <div
                                className="h-8 w-8 animate-pulse rounded-lg shrink-0"
                                style={{ backgroundColor: "#F3F2EE" }}
                            />
                            <div className="flex-1 space-y-1.5">
                                <div
                                    className="h-3.5 w-36 animate-pulse rounded"
                                    style={{ backgroundColor: "#F3F2EE" }}
                                />
                                <div
                                    className="h-3 w-52 animate-pulse rounded"
                                    style={{ backgroundColor: "#F7F6F3" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                    <div
                        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "#F9F8F5", border: "1px solid #EAE8E2" }}
                    >
                        <Activity className="h-5 w-5" style={{ color: "#A09B94" }} />
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: "#171717" }}>
                        No recent activities found
                    </p>
                    <p className="mt-1 max-w-[240px] text-xs" style={{ color: "#77736D" }}>
                        Administrative actions and system updates will appear here.
                    </p>
                </div>
            ) : (
                <ScrollArea className="h-[360px]">
                    <div className="cedar-admin-divided">
                        {activities.map((activity) => {
                            const EntityIcon = entityIcons[activity.type] || Activity
                            const style = entityInlineStyles[activity.type] || entityInlineStyles.product

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F9F8F5] sm:px-6"
                                >
                                    <div
                                        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            backgroundColor: style.backgroundColor,
                                            border: `1px solid ${style.borderColor}`,
                                            color: style.color,
                                        }}
                                    >
                                        <EntityIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p
                                                className="text-[13.5px] font-medium truncate"
                                                style={{ color: "#171717" }}
                                            >
                                                {activity.title}
                                            </p>
                                            <span
                                                className="text-[11.5px] whitespace-nowrap flex-shrink-0"
                                                style={{ color: "#A09B94" }}
                                            >
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p
                                            className="mt-0.5 text-[12px] line-clamp-2"
                                            style={{ color: "#77736D" }}
                                        >
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            )}
        </section>
    )
}
