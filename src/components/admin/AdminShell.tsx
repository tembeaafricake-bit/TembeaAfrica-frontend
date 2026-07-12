'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart2, BookOpen, Users, MapPin, Star, Building2, Compass, UserCheck, BedDouble, Bus, ChevronRight, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store'

const SIDEBAR = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart2 },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { label: 'Tours & Safaris', href: '/admin/tours', icon: Compass },
  { label: 'Guides', href: '/admin/guides', icon: UserCheck },
  { label: 'Stays & Hotels', href: '/admin/stays', icon: BedDouble },
  { label: 'Transport', href: '/admin/transport', icon: Bus },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'All Listings', href: '/admin/listings', icon: Building2 },
]

interface AdminShellProps {
  title: string
  children: React.ReactNode
}

export function AdminShell({ title, children }: AdminShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else if (user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-72 bg-safari-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🐾</div>
            <div>
              <p className="text-sm font-semibold">Tembea Africa</p>
              <p className="text-xs text-white/50">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {SIDEBAR.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white/10 text-white border border-white/15' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-safari-600 grid place-items-center text-sm font-semibold">
              {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/50">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              router.push('/auth/login')
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-950 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Admin console</p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800/80 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              View site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
