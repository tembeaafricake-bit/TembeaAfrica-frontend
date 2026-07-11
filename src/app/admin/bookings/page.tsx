'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle, Clock, XCircle, Filter, ChevronRight } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminShell } from '@/components/admin/AdminShell'
import toast from 'react-hot-toast'

const STATUS_BADGES: Record<string, string> = {
  confirmed: 'text-green-700 bg-green-50',
  pending: 'text-yellow-700 bg-yellow-50',
  cancelled: 'text-red-700 bg-red-50',
  completed: 'text-blue-700 bg-blue-50',
}

export default function AdminBookingsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.getBookings({ limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  return (
    <AdminShell title="Bookings">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">All Bookings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage and review bookings from customers.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" /> Filter status
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
              <BookOpen className="w-4 h-4" /> Recent Bookings
            </div>
            <button onClick={() => refetch()} className="text-xs font-medium text-safari-600 hover:underline">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  {['Booking #', 'Guest', 'Date', 'Amount', 'Status', 'Payment', 'Actions'].map((label) => (
                    <th key={label} className="whitespace-nowrap px-5 py-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!rows?.length ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No bookings available.</td>
                  </tr>
                ) : (
                  rows.map((booking: any) => (
                    <tr key={booking._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{booking.bookingNumber}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{booking.user?.firstName} {booking.user?.lastName}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{booking.startDate}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-safari-700">${booking.totalAmount?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{booking.paymentStatus}</td>
                      <td className="px-5 py-4">
                        <button onClick={async () => { await adminApi.updateBookingStatus(booking._id, booking.status === 'pending' ? 'confirmed' : 'cancelled'); refetch(); toast.success('Status updated') }}
                          className="inline-flex items-center gap-2 rounded-2xl bg-safari-700 px-3 py-2 text-xs font-semibold text-white hover:bg-safari-800 transition-colors">
                          {booking.status === 'pending' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
