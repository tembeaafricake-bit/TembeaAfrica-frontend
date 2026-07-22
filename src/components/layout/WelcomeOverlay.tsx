'use client'

import { useEffect, useState } from 'react'
import { Sparkles, X, Gift, Compass } from 'lucide-react'

export function WelcomeOverlay() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const hasSeenWelcome = window.localStorage.getItem('tembea-welcome-overlay-seen')
      if (!hasSeenWelcome) {
        const timer = window.setTimeout(() => setIsOpen(true), 800)
        return () => window.clearTimeout(timer)
      }
    } catch {
      // Ignore storage access errors
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    try {
      window.localStorage.setItem('tembea-welcome-overlay-seen', 'true')
    } catch {
      // Ignore storage access errors
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-safari-900 via-safari-800 to-emerald-700 p-6 text-white shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
          aria-label="Close welcome message"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
          <Sparkles className="h-4 w-4" /> Welcome aboard
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Your African adventure starts here
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
          We’re so glad you found Tembea Africa. Explore curated safaris, stays, tours, and local experiences designed for unforgettable journeys across Kenya and Tanzania.
        </p>

        <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-amber-200">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-semibold">First-time booking offer</span>
          </div>
          <p className="mt-2 text-sm text-white/90">
            New travelers can enjoy up to <span className="font-semibold text-amber-300">15% off</span> on their first successful booking.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Compass className="h-4 w-4" />
            Start with our best-rated tours and stays
          </div>
          <button
            onClick={handleClose}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-safari-900 transition hover:bg-amber-100"
          >
            Let’s explore
          </button>
        </div>
      </div>
    </div>
  )
}
