import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ToursClient } from './ToursClient'
import { BackButton } from '@/components/ui/BackButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tours & Safaris — Kenya & Tanzania',
  description: 'Book world-class safari tours, beach excursions, mountain climbs and cultural experiences across Africa.',
}

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading tours...</div>}>
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Handpicked experiences</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Tours & Safaris</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            From sunrise balloon safaris to mountain summit treks — book with confidence on Africa's #1 platform.
          </p>
        </div>
        <ToursClient />
      </main>
      <Footer />
    </>
    </Suspense>
  )
}
