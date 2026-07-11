'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, BookOpen, DollarSign, TrendingUp, Check, Trash2, BarChart2, MapPin, Star, Building2, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'

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
    <AdminShell title="Dashboard">
      <div className="space-y-6">
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
      </div>
    </AdminShell>
  )
}
