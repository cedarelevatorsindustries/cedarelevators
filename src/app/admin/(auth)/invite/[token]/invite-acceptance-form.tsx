'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptAdminInviteAction } from '@/lib/actions/admin-auth'
import { toast } from 'sonner'
import { Lock, User, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface Props {
    token: string
    email: string
}

export function InviteAcceptanceForm({ token, email }: Props) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsSubmitting(false)
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            setIsSubmitting(false)
            return
        }

        try {
            const result = await acceptAdminInviteAction(token, formData.password, formData.name)

            if (!result.success) {
                setError(result.error || 'Failed to accept invite')
                toast.error(result.error || 'Failed to accept invite')
                return
            }

            toast.success('Account created successfully!')
            router.push('/admin/login?invited=true')

        } catch (err) {
            setError('An unexpected error occurred')
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-6">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800">{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="name"
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                        placeholder="Manikandan S"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Create Password <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isSubmitting}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Accepting invitation...
                    </>
                ) : (
                    <>
                        Accept Invitation
                        <ArrowRight className="h-5 w-5" />
                    </>
                )}
            </button>
        </form>
    )
}
