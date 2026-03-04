'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AdminHeader from '@/components/admin/AdminHeader'
import { ChevronLeft, Upload, Building2, Globe, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function NewOrganizationPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: '',
        slug: '',
        logo: null as File | null,
    })

    const industries = [
        'Municipal Services',
        'Water & Sanitation',
        'Waste Management',
        'Electricity',
        'Traffic & Transport',
        'Public Health',
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate slug from name if slug is empty or matches previous auto-gen
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {})
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock creation logic
        console.log('Creating organization:', formData)
        router.push('/admin/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AdminHeader />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Breadcrumbs/Back */}
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Create Organization</h1>
                        <p className="text-slate-500">Register a new entity to manage civic issues efficiently.</p>
                    </div>

                    <Card className="p-8 border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Logo Upload Section */}
                            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all mb-3 border border-slate-100">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-700">Upload Organization Logo</p>
                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG or JPG up to 2MB</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" />
                            </div>

                            <div className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. City Municipality"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="h-11 border-slate-200 focus:ring-teal-500 focus:border-teal-500 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        Slug (URL Identifier)
                                    </Label>
                                    <div className="flex items-center">
                                        <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 h-11 flex items-center text-sm text-slate-500">
                                            parvah.com/
                                        </span>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className="h-11 border-slate-200 focus:ring-teal-500 focus:border-teal-500 rounded-l-none rounded-r-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="industry" className="text-sm font-semibold flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        Industry/Department
                                    </Label>
                                    <Select
                                        onValueChange={(val) => setFormData(p => ({ ...p, industry: val }))}
                                    >
                                        <SelectTrigger className="h-11 border-slate-200 rounded-xl focus:ring-teal-500">
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map(ind => (
                                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Briefly describe the organization's purpose..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="min-h-[120px] border-slate-200 focus:ring-teal-500 focus:border-teal-500 rounded-xl resize-none py-3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/20 text-white font-bold"
                                >
                                    Create Organization
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    )
}
