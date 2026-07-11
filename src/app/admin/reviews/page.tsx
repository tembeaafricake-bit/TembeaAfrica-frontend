'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star, CheckCircle, Trash2, RefreshCcw } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminShell } from '@/components/admin/AdminShell'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => adminApi.getReviews({ approved: 'false', limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  return (
    <AdminShell title="Reviews">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Review moderation</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approve or remove reviews before they go live.</p>
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {!rows?.length ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Star className="mx-auto mb-4 h-12 w-12 text-safari-600" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">No pending reviews</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">All reviews are approved or there are none to moderate.</p>
            </div>
          ) : rows.map((review: any) => (
            <div key={review._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{review.user?.firstName} {review.user?.lastName}</span>
                    <span>on {review.targetType}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">{review.rating} stars</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{review.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{review.body}</p>
                  <p className="text-xs text-gray-400">Submitted {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={async () => { await adminApi.approveReview(review._id); refetch(); toast.success('Review approved') }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={async () => { await adminApi.deleteReview(review._id); refetch(); toast.success('Review deleted') }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
