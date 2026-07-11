'use client'

import { AdminShell } from '@/components/admin/AdminShell'
import { FALLBACK_TRANSPORT } from '@/lib/fallback-data'
import { Bus, Car, Plane, Ship } from 'lucide-react'

const TYPE_ICONS: Record<string, typeof Bus> = { bus: Bus, car: Car, flight: Plane, ferry: Ship }

export default function AdminTransportPage() {
  return (
    <AdminShell title="Transport">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Transport services</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Transport listings are displayed on the public site. Backend transport management will be expanded in a future update.
            For now, the following services are available to travellers:
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FALLBACK_TRANSPORT.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Bus
            return (
              <div key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-safari-100 dark:bg-safari-900/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-safari-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.route}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-safari-700">${item.price}</span>
                  <span className="text-gray-400 text-xs">{item.duration}</span>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </AdminShell>
  )
}
