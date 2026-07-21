'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallback?: string
  label?: string
  className?: string
}

export function BackButton({ fallback = '/', label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if we can go back using browser history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      setCanGoBack(true)
    }
  }, [])

  const handleBack = () => {
    if (fallback && typeof window !== 'undefined' && fallback !== window.location.pathname) {
      router.push(fallback)
      return
    }

    if (canGoBack && typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (typeof document !== 'undefined' && document.referrer && isMounted) {
      try {
        const referrerUrl = new URL(document.referrer)
        if (referrerUrl.origin === window.location.origin) {
          router.push(referrerUrl.pathname + referrerUrl.search + referrerUrl.hash)
          return
        }
      } catch {
        // ignore
      }
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
