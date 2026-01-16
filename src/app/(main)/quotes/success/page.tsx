'use client'

import { FileText, Store, BookOpen } from 'lucide-react'
import SuccessAnimation from '@/modules/checkout/components/success-animation'
import ConfirmationTemplate from '@/modules/checkout/components/confirmation-template'

export default function QuoteSuccessPage() {
    // In a real implementation, you would fetch the quote ID from URL params or session
    const quoteId = 'QT-10435'
    const submittedDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <SuccessAnimation>
            <ConfirmationTemplate
                type="quote"
                id={quoteId}
                title="Quote Request Submitted!"
                subtitle="Your request has been successfully sent to our sales department. We've sent a confirmation email to your inbox."
                summaryDetails={[
                    {
                        label: 'Quote ID',
                        value: `#${quoteId}`,
                        icon: <FileText className="w-4 h-4" />,
                    },
                    {
                        label: 'Submitted On',
                        value: submittedDate,
                    },
                    {
                        label: 'Account Type',
                        value: 'Business Account',
                    },
                ]}
                steps={[
                    {
                        number: 1,
                        title: 'Admin Review',
                        description: 'Our sales team is currently reviewing your inventory requirements.',
                        badge: 'IN PROCESS',
                        badgeColor: 'orange',
                    },
                    {
                        number: 2,
                        title: 'Pricing Updates',
                        description: 'Custom pricing and discounts will be applied to your quote items.',
                    },
                    {
                        number: 3,
                        title: 'Notification via Email',
                        description: "You'll receive an email as soon as your quote is ready for approval.",
                    },
                ]}
                actions={[
                    {
                        label: 'View All Quotes',
                        href: '/quotes',
                        variant: 'default',
                        icon: <BookOpen className="w-4 h-4" />,
                    },
                    {
                        label: 'Back to Store',
                        href: '/catalog',
                        variant: 'outline',
                        icon: <Store className="w-4 h-4" />,
                    },
                ]}
                helpLink="/contact"
            />
        </SuccessAnimation>
    )
}
