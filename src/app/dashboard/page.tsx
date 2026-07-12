'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Heart, MessageSquare, User, Settings, Star, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuthStore } from '@/store'
import { bookingsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

const STATUS_CONFIG = {
  confirmed: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Confirmed' },
  pending: { color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle, label: 'Pending' },
  cancelled: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' },
  completed: { color: 'text-blue-600 bg-blue-50', icon: CheckCircle, label: 'Completed' },
}

const TABS = ['Bookings', 'Wishlist', 'Messages', 'Profile', 'Settings']

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Bookings')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) router.push('/auth/login?next=/dashboard')
  }, [mounted, isAuthenticated, router])

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMyBookings().then(r => r.data),
    enabled: isAuthenticated,
  })

  const bookings = bookingsData || []

  if (!mounted || !isAuthenticated || !user) return null

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-safari-gradient py-10 px-4">
          <div className="max-w-6xl mx-auto flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border border-white/30">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Welcome back, {user.firstName}! 👋</h1>
              <p className="text-white/70 text-sm mt-1">{user.email} · {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total bookings', value: bookings.length, icon: Calendar, color: 'text-safari-600 bg-safari-50' },
              { label: 'Completed trips', value: bookings.filter((b: any) => b.status === 'completed').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Pending', value: bookings.filter((b: any) => b.status === 'pending').length, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Destinations visited', value: new Set(bookings.map((b: any) => b.startDate?.split('-')[0])).size, icon: MapPin, color: 'text-blue-600 bg-blue-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1 mb-6 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-safari-700 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Bookings tab */}
          {activeTab === 'Bookings' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                  <div className="w-8 h-8 border-2 border-safari-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading your bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                  <div className="text-5xl mb-4">🦒</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                  <p className="text-gray-500 text-sm mb-5">Start exploring Africa's most incredible destinations</p>
                  <Link href="/tours" className="inline-flex items-center gap-2 bg-safari-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-safari-800 transition-colors">
                    Browse tours <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                bookings.map((booking: any, i: number) => {
                  const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
                  const StatusIcon = status.icon
                  return (
                    <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                              <StatusIcon className="w-3 h-3" /> {status.label}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{booking.bookingNumber}</span>
                          </div>
                          <div className="space-y-1 mt-2">
                            {booking.items?.slice(0, 2).map((item: any, j: number) => (
                              <p key={j} className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.startDate}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Booked {new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-safari-700">${booking.totalAmount?.toLocaleString()}</p>
                          <p className={`text-xs mt-0.5 ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {booking.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                          </p>
                          {booking.status === 'pending' && (
                            <Link href="/checkout" className="text-xs text-safari-600 font-medium hover:underline mt-2 block">
                              Complete payment →
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}

          {/* Profile tab */}
          {activeTab === 'Profile' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-safari-600" /> Profile information
              </h3>
              <div className="space-y-4">
                {[
                  ['First name', user.firstName],
                  ['Last name', user.lastName],
                  ['Email address', user.email],
                  ['Phone', user.phone || 'Not provided'],
                  ['Nationality', user.nationality || 'Not provided'],
                  ['Role', user.role.charAt(0).toUpperCase() + user.role.slice(1)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-3 border border-safari-200 text-safari-700 rounded-xl text-sm font-medium hover:bg-safari-50 transition-colors">
                Edit profile
              </button>
            </div>
          )}

          {/* Wishlist tab */}
          {activeTab === 'Wishlist' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
              <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 text-sm mb-5">Save tours and destinations you love</p>
              <Link href="/destinations" className="inline-flex items-center gap-2 bg-safari-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-safari-800 transition-colors">
                Explore destinations
              </Link>
            </div>
          )}

          {/* Messages tab */}
          {activeTab === 'Messages' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-500 text-sm">Your conversations with guides and operators will appear here</p>
            </div>
          )}

          {/* Settings tab */}
          {activeTab === 'Settings' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-safari-600" /> Account settings
              </h3>
              <div className="space-y-3">
                {['Change password', 'Email notifications', 'SMS notifications', 'Currency preference', 'Delete account'].map(setting => (
                  <button key={setting} className="w-full flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{setting}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
              <button onClick={() => { logout(); router.push('/') }}
                className="mt-4 w-full py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                Sign out of account
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
