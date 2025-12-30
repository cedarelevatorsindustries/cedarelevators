import Link from 'next/link'
import { verifyInviteToken } from '@/lib/admin-auth-server'
import { InviteAcceptanceForm } from './invite-acceptance-form'
import { Shield } from 'lucide-react'

interface Props {
    params: Promise<{
        token: string
    }>
}

export default async function InviteAcceptancePage({ params }: Props) {
    const { token } = await params

    // Verify token on server side
    const { success, error, invite } = await verifyInviteToken(token)

    if (!success || !invite) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            <span className="font-semibold">Invalid Invitation</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Invitation Error
                        </h2>
                        <p className="text-gray-600 mb-6 font-medium">
                            {error || 'This invitation link is invalid or has expired.'}
                        </p>
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8">
                            <p className="text-sm text-orange-800">
                                Please contact your administrator to request a new invitation link.
                            </p>
                        </div>
                        <Link
                            href="/admin/login"
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-block text-center"
                        >
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header Badge */}
                <div className="flex justify-center mb-6">
                    <div className="bg-orange-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">Accept Admin Invitation</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to the Team
                        </h1>
                        <p className="text-gray-600">
                            Complete your registration to access the admin dashboard
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex gap-3 justify-center items-center">
                            <div className="text-sm text-center">
                                <p className="text-orange-900">
                                    You have been invited as <strong>{invite.role.replace('_', ' ').toUpperCase()}</strong>
                                </p>
                                <p className="text-orange-800 text-xs mt-1">
                                    Account email: {invite.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <InviteAcceptanceForm token={token} email={invite.email} />
                </div>
            </div>
        </div>
    )
}
