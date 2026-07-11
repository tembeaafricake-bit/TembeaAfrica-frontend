import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StaysClient } from './StaysClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels & Stays — Kenya & Tanzania',
  description: 'Book hotels, lodges, BnBs and resorts across Kenya and Tanzania.',
}

export default function StaysPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Rest in style</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Hotels & Stays</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">From safari lodges to beachfront resorts — find your perfect stay.</p>
        </div>
        <StaysClient />
      </main>
      <Footer />
    </>
  )
}
