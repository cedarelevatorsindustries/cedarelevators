'use client';

import React from 'react';
import { AlertCircle, Clock, TrendingUp, Zap } from 'lucide-react';

type Priority = 'low' | 'normal' | 'medium' | 'high';

interface PriorityBadgeProps {
    priority: Priority;
    size?: 'sm' | 'md';
    showIcon?: boolean;
    showLabel?: boolean;
}

export function PriorityBadge({
    priority,
    size = 'md',
    showIcon = true,
    showLabel = true
}: PriorityBadgeProps) {
    const config = {
        low: {
            label: 'Low Priority',
            icon: Clock,
            className: 'bg-gray-100 text-gray-700 border-gray-200',
            iconColor: 'text-gray-600'
        },
        normal: {
            label: 'Normal',
            icon: AlertCircle,
            className: 'bg-blue-100 text-blue-700 border-blue-200',
            iconColor: 'text-blue-600'
        },
        medium: {
            label: 'Medium Priority',
            icon: TrendingUp,
            className: 'bg-amber-100 text-amber-700 border-amber-200',
            iconColor: 'text-amber-600'
        },
        high: {
            label: 'High Priority',
            icon: Zap,
            className: 'bg-red-100 text-red-700 border-red-200',
            iconColor: 'text-red-600'
        }
    }[priority];

    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4'
    };

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${config.className} ${sizeClasses[size]}`}>
            {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
            {showLabel && <span>{config.label}</span>}
        </div>
    );
}

// Helper to get estimated response time based on priority
export function getEstimatedResponseTime(priority: Priority): string {
    switch (priority) {
        case 'high':
            return '4-8 hours';
        case 'medium':
            return '12-24 hours';
        case 'normal':
            return '24-48 hours';
        case 'low':
            return '48-72 hours';
        default:
            return '24-48 hours';
    }
}
