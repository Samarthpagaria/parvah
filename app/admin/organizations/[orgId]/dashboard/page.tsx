'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import OrgAssistant from '@/components/admin/OrgAssistant'
import Link from 'next/link'
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts'
import { analyticsAPI, orgAPI, authAPI } from '@/utils/backend_api_endpoints'
import { 
    Activity, CheckCircle2, AlertCircle, Clock, 
    BarChart3, PieChart as PieIcon, TrendingUp, Users 
} from 'lucide-react'

// Mock fallback data just in case


const COLORS = ['#576CDB', '#088395', '#F25A5A', '#7AB2B2', '#FFBB28', '#FF8042']

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [loading, setLoading] = useState(true)
    const [org, setOrg] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [overview, setOverview] = useState<any>(null)
    const [trends, setTrends] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [statusDist, setStatusDist] = useState<any[]>([])
    const [staffPerf, setStaffPerf] = useState<any[]>([])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ov, tr, cat, st, sp, orgRes, userRes] = await Promise.all([
                    analyticsAPI.getOverview(orgId),
                    analyticsAPI.getTrends(orgId),
                    analyticsAPI.getByCategory(orgId),
                    analyticsAPI.getByStatus(orgId),
                    analyticsAPI.getStaffPerformance(orgId),
                    orgAPI.getDetails(orgId),
                    authAPI.getMe()
                ])
                setOverview(ov)
                setTrends(tr.trends || [])
                setCategories(cat.categories || [])
                setStatusDist(st.distribution || [])
                setStaffPerf(sp.staff || [])
                setOrg(orgRes.organization)
                setUser(userRes.user)
            } catch (err) {
                console.error("Failed to fetch analytics", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [orgId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#201F47] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-normal animate-pulse">Loading Analytics Hub...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <OrgSidebar orgId={orgId} orgName={org?.name || overview?.orgName || 'Organization'} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{org?.name || overview?.orgName || 'Organization'}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Analytics Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <Link href="/admin/profile" className="w-8 h-8 rounded-xl bg-[#088395]/10 text-[#088395] flex items-center justify-center font-normal text-[13px] hover:ring-2 hover:ring-[#088395]/20 transition-all">
                                {user?.full_name?.split(' ').map((n: any) => n[0]).join('') || 'A'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-auto flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-2 tracking-tight">Analytics Hub</h1>
                            <p className="text-[15px] font-normal text-gray-500">Real-time insights and performance metrics for your organization.</p>
                        </div>
                        <div className="flex gap-3">
                             <Link href={`/admin/organizations/${orgId}/kanban`} className="px-4 py-2 bg-[#201F47] text-white text-[13px] rounded-xl hover:bg-[#14122d] transition-all flex items-center gap-2 shadow-lg shadow-[#201F47]/10">
                                <Activity className="w-4 h-4" />
                                Open Board
                             </Link>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard title="Total Issues" value={overview?.total} icon={<Activity className="text-blue-500" />} trend="+12% from last month" />
                        <KPICard title="Open Issues" value={overview?.open} icon={<AlertCircle className="text-red-500" />} trend="Requires attention" />
                        <KPICard title="Avg. Resolution" value={`${overview?.avgResolutionHours || 0}h`} icon={<Clock className="text-orange-500" />} trend="Improved performance" />
                        <KPICard title="Resolution Rate" value={`${overview?.resolutionRate || 0}%`} icon={<CheckCircle2 className="text-green-500" />} trend="Consistent performance" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Submission Trends */}
                        <ChartWrapper title="Submission Volume" subtitle="Daily reports over time" icon={<TrendingUp className="w-4 h-4" />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#576CDB" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#576CDB" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#576CDB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartWrapper>

                        {/* Status Distribution */}
                        <ChartWrapper title="Status Distribution" subtitle="Issue lifecycle breakdown" icon={<PieIcon className="w-4 h-4" />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {statusDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartWrapper>

                        {/* Category Analysis */}
                        <ChartWrapper title="Category Breakdown" subtitle="Issues reported by category" icon={<BarChart3 className="w-4 h-4" />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categories} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                                    <YAxis 
                                        dataKey="categoryName" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#4B5563', fontSize: 12}}
                                        width={100}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="count" fill="#088395" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartWrapper>

                        {/* Staff Efficiency */}
                        <ChartWrapper title="Staff Performance" subtitle="Resolved issues per member" icon={<Users className="w-4 h-4" />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={staffPerf}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="fullName" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 11}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                    <Tooltip 
                                        cursor={{fill: '#f9fafb'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="resolvedCount" fill="#576CDB" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                    </div>
                </main>
            </div>

            <OrgAssistant orgId={orgId} />
        </div>
    )
}

function KPICard({ title, value, icon, trend }: { title: string; value: any; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-inner">
                    {icon}
                </div>
                <div>
                    <p className="text-[13px] font-normal text-gray-400 mb-1">{title}</p>
                    <p className="text-[32px] font-normal text-[#201F47] leading-none tracking-tight">{value || 0}</p>
                </div>
                <p className="text-[11px] font-normal text-gray-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 inline text-green-500" />
                    {trend}
                </p>
            </div>
        </div>
    )
}

function ChartWrapper({ title, subtitle, children, icon }: { title: string; subtitle: string; children: React.ReactNode; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#201F47]/5 flex items-center justify-center text-[#201F47]">
                            {icon}
                        </div>
                        <h3 className="text-[17px] font-normal text-[#201F47]">{title}</h3>
                    </div>
                    <p className="text-[13px] font-normal text-gray-400 ml-10">{subtitle}</p>
                </div>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
