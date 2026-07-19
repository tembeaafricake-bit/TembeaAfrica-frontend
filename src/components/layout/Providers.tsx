'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { authApi } from '@/lib/api'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }))

  useEffect(() => {
    const logPageVisit = async () => {
      try {
        await authApi.logVisit(pathname || '/')
      } catch (err) {
        console.error('Failed to log page visit:', err)
      }
    }
    logPageVisit()
  }, [pathname])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch((error) => {
            console.warn('Failed to unregister service worker:', error)
          })
        })
      }).catch((error) => {
        console.warn('Unable to query service worker registrations:', error)
      })

      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        }).catch((error) => {
          console.warn('Unable to clear caches:', error)
        })
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <PWAInstallPrompt />
        <CookieConsent />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
