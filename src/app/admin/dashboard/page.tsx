'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, BookOpen, DollarSign, TrendingUp, Shield, Eye, Check, Trash2, BarChart2, MapPin, Star, AlertTriangle, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

const SIDEBAR = [
  { label: 'Dashboard', icon: BarChart2, href: '/admin/dashboard', active: true },
  { label: 'Bookings', icon: BookOpen, href: '/admin/bookings' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Destinations', icon: MapPin, href: '/admin/destinations' },
  { label: 'Reviews', icon: Star, href: '/admin/reviews' },
  { label: 'Disputes', icon: AlertTriangle, href: '/admin/disputes' },
  { label: 'Payments', icon: DollarSign, href: '/admin/payments' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews'>('bookings')

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
    else if (user?.role !== 'admin') router.push('/dashboard')
  }, [isAuthenticated, user, router])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    enabled: user?.role === 'admin',
    refetchInterval: 60000,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.getBookings({ limit: 10 }).then(r => r.data),
    enabled: user?.role === 'admin',
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['admin-reviews', 'pending'],
    queryFn: () => adminApi.getReviews({ approved: 'false', limit: 10 }).then(r => r.data),
    enabled: user?.role === 'admin',
  })

  if (!isAuthenticated || user?.role !== 'admin') return null

  const kpis = [
    { label: 'Revenue (MTD)', value: stats ? `$${(stats.revenue?.thisMonth || 0).toLocaleString()}` : '—', sub: stats ? `+${stats.revenue?.growth?.toFixed(1) || 0}% vs last month` : '', icon: DollarSign, color: 'text-safari-600 bg-safari-50 dark:bg-safari-900/20' },
    { label: 'Total bookings', value: stats ? stats.bookings?.total?.toLocaleString() : '—', sub: stats ? `${stats.bookings?.thisMonth} this month` : '', icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active users', value: stats ? stats.users?.total?.toLocaleString() : '—', sub: stats ? `+${stats.users?.thisMonth} new this month` : '', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Commission earned', value: stats ? `$${(stats.revenue?.commission || 0).toLocaleString()}` : '—', sub: '10% of confirmed bookings', icon: TrendingUp, color: 'text-golden-600 bg-golden-50 dark:bg-golden-900/20' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50', pending: 'text-yellow-600 bg-yellow-50',
    cancelled: 'text-red-600 bg-red-50', completed: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 bg-safari-900 flex flex-col flex-shrink-0 min-h-screen">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-base">🐾</div>
            <div>
              <div className="text-white font-semibold text-sm">Tembea Africa</div>
              <div className="text-white/40 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {SIDEBAR.map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 transition-all ${item.active ? 'text-white bg-white/10 border-golden-400' : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-safari-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-white/40 text-xs">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500">All systems operational</span>
            <Link href="/" className="text-xs text-safari-600 font-medium">View site →</Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{kpi.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{statsLoading ? <span className="text-gray-300">—</span> : kpi.value}</div>
                <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Booking status pills */}
          {stats?.bookingsByStatus && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bookings by status</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-50 text-gray-600'}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}: <span className="font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {(['bookings', 'reviews'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-safari-700 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>
                {tab}
                {tab === 'reviews' && reviewsData?.data?.length > 0 && (
                  <span className="ml-2 bg-golden-500 text-white text-xs px-1.5 py-0.5 rounded-full">{reviewsData.data.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings table */}
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent bookings</h3>
                <Link href="/admin/bookings" className="text-xs text-safari-600 font-medium flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      {['Booking #', 'Guest', 'Items', 'Date', 'Amount', 'Status', 'Payment'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsData?.data?.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No bookings yet</td></tr>
                    ) : bookingsData?.data?.map((b: any) => (
                      <tr key={b._id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingNumber}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{b.user?.firstName} {b.user?.lastName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-32 truncate">{b.items?.[0]?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{b.startDate}</td>
                        <td className="px-4 py-3 font-semibold text-safari-700">${b.totalAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-50 text-gray-600'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${b.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews moderation */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {!reviewsData?.data?.length ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-900 dark:text-white font-medium">All reviews approved!</p>
                  <p className="text-gray-400 text-sm mt-1">No pending reviews to moderate</p>
                </div>
              ) : reviewsData.data.map((review: any) => (
                <div key={review._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-safari-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.user?.firstName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{review.user?.firstName} {review.user?.lastName}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400 capitalize">{review.targetType}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-golden-400 text-golden-400' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{review.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{review.body}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={async () => { await adminApi.approveReview(review._id); refetchReviews(); toast.success('Review approved') }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={async () => { await adminApi.deleteReview(review._id); refetchReviews(); toast.success('Review deleted') }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
