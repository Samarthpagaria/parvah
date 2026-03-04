'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, UserCheck, Heart, User } from 'lucide-react'

export default function AcceptInvitePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        fullName: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Mock completion logic
        console.log('Completing profile with token:', token, formData)
        router.push('/admin/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-primary/10 mb-6 border border-slate-100 group transition-all hover:scale-105">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white">
                            <UserCheck className="w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Complete Profile</h1>
                    <p className="text-slate-500 mt-2">You've been invited to join <strong>City Municipality</strong></p>
                </div>

                <Card className="p-8 border-slate-200 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-[2rem]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Full Name
                            </Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="h-12 border-slate-200 focus:ring-primary focus:border-primary rounded-xl px-4"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Create Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="h-12 border-slate-200 focus:ring-primary focus:border-primary rounded-xl px-4"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="h-12 border-slate-200 focus:ring-primary focus:border-primary rounded-xl px-4"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-xl shadow-primary/20 text-white font-bold text-lg"
                        >
                            Join Organization
                        </Button>
                    </form>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    Protected by Parvah Secure Auth™
                </div>
            </div>
        </div>
    )
}
