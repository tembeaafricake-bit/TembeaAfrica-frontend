'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, BookOpen, DollarSign, TrendingUp, Check, Trash2, BarChart2, MapPin, Star, Building2, ChevronRight, Eye, UserCheck, UserX, Globe } from 'lucide-react'
import { useAuthStore } from '@/store'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'

const getCountryFlag = (country: string) => {
  const flags: Record<string, string> = {
    Kenya: '🇰🇪', Tanzania: '🇹🇿', Uganda: '🇺🇬', Rwanda: '🇷🇼',
    'South Africa': '🇿🇦', Morocco: '🇲🇦', Egypt: '🇪🇬',
    'United States': '🇺🇸', 'United Kingdom': '🇬🇧', Canada: '🇨🇦',
    Germany: '🇩🇪', France: '🇫🇷', Local: '🖥️'
  }
  return flags[country] || '🏳️'
}

const getBrowserName = (ua: string) => {
  if (!ua) return 'Unknown'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Mobile')) return 'Mobile Browser'
  return 'Desktop'
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews'>('bookings')
  const [activeDashboard, setActiveDashboard] = useState<'overview' | 'analytics'>('overview')

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

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics().then(r => r.data),
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.getBookings({ limit: 10 }).then(r => r.data),
    enabled: user?.role === 'admin',
  })

  const { data: reviewsData } = useQuery({
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

  const analyticsKpis = [
    { label: 'Total Pageviews', value: analytics ? analytics.totalVisits?.toLocaleString() : '—', sub: 'Total visitor hits registered', icon: Eye, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Signed-in Visits', value: analytics ? analytics.authenticatedVisits?.toLocaleString() : '—', sub: analytics ? `${((analytics.authenticatedVisits / (analytics.totalVisits || 1)) * 100).toFixed(1)}% of pageviews` : '', icon: UserCheck, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Anonymous Visits', value: analytics ? analytics.anonymousVisits?.toLocaleString() : '—', sub: analytics ? `${((analytics.anonymousVisits / (analytics.totalVisits || 1)) * 100).toFixed(1)}% of pageviews` : '', icon: UserX, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/20' },
    { label: 'Unique Countries', value: analytics ? analytics.uniqueCountries?.toLocaleString() : '—', sub: 'Geographic traffic spread', icon: Globe, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50', pending: 'text-yellow-600 bg-yellow-50',
    cancelled: 'text-red-600 bg-red-50', completed: 'text-blue-600 bg-blue-50',
  }

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        {/* Dashboard toggle tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveDashboard('overview')}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeDashboard === 'overview'
                ? 'border-safari-600 text-safari-600 dark:text-safari-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Business Overview
          </button>
          <button
            onClick={() => setActiveDashboard('analytics')}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeDashboard === 'analytics'
                ? 'border-safari-600 text-safari-600 dark:text-safari-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Visitor Analytics
          </button>
        </div>

        {activeDashboard === 'overview' ? (
          <>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {kpis.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">{kpi.label}</p>
                    <div className={`rounded-2xl p-3 ${kpi.color}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{statsLoading ? '—' : kpi.value}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{kpi.sub}</p>
                </motion.div>
              ))}
            </section>

            {stats?.bookingsByStatus && (
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bookings by status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track the latest booking states.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                    <div key={status} className={`rounded-full px-4 py-2 text-sm font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'} `}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}: {String(count)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent bookings</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Latest activity from customers.</p>
                  </div>
                  <Link href="/admin/bookings" className="text-xs font-semibold text-safari-600 hover:underline">View all</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        {['Booking #', 'Guest', 'Items', 'Date', 'Amount', 'Status', 'Payment'].map((label) => (
                          <th key={label} className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!bookingsData?.data?.length ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No bookings yet.</td>
                        </tr>
                      ) : bookingsData.data.map((booking: any) => (
                        <tr key={booking._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{booking.bookingNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{booking.user?.firstName} {booking.user?.lastName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{booking.items?.[0]?.name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{booking.startDate}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-safari-700">${booking.totalAmount?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{booking.paymentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Pending reviews</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review items that need approval.</p>
                  </div>
                  <Link href="/admin/reviews" className="text-xs font-semibold text-safari-600 hover:underline">Manage</Link>
                </div>
                {reviewsData?.data?.length ? (
                  <div className="space-y-4">
                    {reviewsData.data.map((review: any) => (
                      <div key={review._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.user?.firstName} {review.user?.lastName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{review.targetType}</p>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{review.body}</p>
                          </div>
                          <span className="rounded-full bg-safari-100 px-3 py-1 text-xs font-semibold text-safari-700">{review.rating} ★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                    No pending reviews.
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {analyticsKpis.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">{kpi.label}</p>
                    <div className={`rounded-2xl p-3 ${kpi.color}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{analyticsLoading ? '—' : kpi.value}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{kpi.sub}</p>
                </motion.div>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Countries breakdown */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Visits by Country</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Traffic distribution by geolocation.</p>
                <div className="space-y-4">
                  {!analytics?.countriesBreakdown?.length ? (
                    <p className="text-sm text-gray-500 text-center py-6">No location data recorded.</p>
                  ) : (
                    analytics.countriesBreakdown.map((item: any) => {
                      const percentage = analytics.totalVisits > 0 ? (item.count / analytics.totalVisits) * 100 : 0
                      return (
                        <div key={item.country} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <span className="text-lg">{getCountryFlag(item.country)}</span>
                              {item.country}
                            </span>
                            <span className="text-gray-500">{item.count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-safari-600 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Pages breakdown */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Most Popular Pages</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Which pages visitors visit most frequently.</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Page URL</th>
                        <th className="px-4 py-2.5 font-medium text-right">Views</th>
                        <th className="px-4 py-2.5 font-medium text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!analytics?.pagesBreakdown?.length ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-10 text-center text-gray-500">No page views recorded.</td>
                        </tr>
                      ) : (
                        analytics.pagesBreakdown.map((page: any) => {
                          const percentage = analytics.totalVisits > 0 ? (page.count / analytics.totalVisits) * 100 : 0
                          return (
                            <tr key={page.pageUrl} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-950/20">
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white truncate max-w-xs">{page.pageUrl}</td>
                              <td className="px-4 py-2.5 text-right text-gray-900 dark:text-white font-semibold">{page.count}</td>
                              <td className="px-4 py-2.5 text-right text-gray-500">{percentage.toFixed(1)}%</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Live Visitor Log */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Live Visitor Log</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Real-time visitor logs from the platform (last 50 visits).</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">User Status</th>
                      <th className="px-4 py-3 font-medium">IP Address</th>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Page Visited</th>
                      <th className="px-4 py-3 font-medium">Device/Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!analytics?.recentVisits?.length ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No visitors recorded.</td>
                      </tr>
                    ) : (
                      analytics.recentVisits.map((visit: any) => (
                        <tr key={visit._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/40">
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                            <span className="text-[10px] text-gray-400">({new Date(visit.createdAt).toLocaleDateString()})</span>
                          </td>
                          <td className="px-4 py-3">
                            {visit.user ? (
                              <div className="flex items-center gap-2">
                                {visit.user.avatar ? (
                                  <img src={visit.user.avatar} className="w-5 h-5 rounded-full object-cover" alt="User avatar" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-safari-700 text-white text-[10px] flex items-center justify-center font-bold">
                                    {visit.user.firstName[0]}
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {visit.user.firstName} {visit.user.lastName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic font-mono flex items-center gap-1">
                                👤 Anonymous Guest
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white">{visit.ip}</td>
                          <td className="px-4 py-3 text-xs text-gray-850 dark:text-gray-200">
                            <span className="mr-1">{getCountryFlag(visit.country)}</span>
                            {visit.country}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-safari-700 dark:text-safari-400 truncate max-w-xs">{visit.pageUrl}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{getBrowserName(visit.userAgent)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  )
}
