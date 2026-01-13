'use client'

interface OrderStatusBadgeProps {
    status: string
    className?: string
}

const statusConfig = {
    placed: {
        label: 'Placed',
        className: 'bg-gray-100 text-gray-700'
    },
    pending: {
        label: 'Pending Payment',
        className: 'bg-yellow-100 text-yellow-700'
    },
    processing: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-700'
    },
    shipped: {
        label: 'Shipped',
        className: 'bg-purple-100 text-purple-700'
    },
    delivered: {
        label: 'Delivered',
        className: 'bg-green-100 text-green-700'
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700'
    }
}

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.placed

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.className} ${className}`}>
            {config.label}
        </span>
    )
}
