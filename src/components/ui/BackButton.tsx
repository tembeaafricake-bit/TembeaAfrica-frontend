'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallback?: string
  label?: string
  className?: string
}

export function BackButton({ fallback = '/', label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (typeof document !== 'undefined' && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer)
        if (referrerUrl.origin === window.location.origin) {
          router.push(referrerUrl.pathname + referrerUrl.search + referrerUrl.hash)
          return
        }
      } catch {
        // ignore invalid referrer URL
      }
    }

    if (fallback && fallback !== '/') {
      router.push(fallback)
      return
    }

    router.push('/')
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
