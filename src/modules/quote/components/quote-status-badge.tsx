import React from 'react';
import { QuoteStatus } from '../types';

interface QuoteStatusBadgeProps {
    status: QuoteStatus;
    className?: string;
}

export function QuoteStatusBadge({ status, className = '' }: QuoteStatusBadgeProps) {
    const statusStyles: Record<QuoteStatus, string> = {
        draft: 'bg-neutral-100 text-neutral-800 border-neutral-200',
        submitted: 'bg-blue-50 text-blue-800 border-blue-200',
        reviewing: 'bg-orange-50 text-orange-800 border-orange-200',
        approved: 'bg-green-50 text-green-800 border-green-200',
        rejected: 'bg-red-50 text-red-800 border-red-200',
        converted: 'bg-purple-50 text-purple-800 border-purple-200',
    };

    const labels: Record<QuoteStatus, string> = {
        draft: 'Draft',
        submitted: 'Submitted',
        reviewing: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        converted: 'Converted to Order',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block ${statusStyles[status]} ${className}`}>
            {labels[status]}
        </span>
    );
}
