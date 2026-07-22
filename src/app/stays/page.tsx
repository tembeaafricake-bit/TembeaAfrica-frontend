import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StaysClient } from './StaysClient'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels, Lodges & Stays in Kenya & Tanzania | Tembea Africa',
  description: 'Find luxury safari lodges, beach resorts, boutique hotels, and comfortable stays in Kenya and Tanzania.',
  keywords: ['Kenya hotels', 'Tanzania lodges', 'safari lodge', 'beach resort', 'boutique hotel Kenya'],
  alternates: { canonical: '/stays' },
}

export default function StaysPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading stays...</div>}>
      <>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Hotels, Lodges & Stays in Kenya & Tanzania',
          description: 'Find safari lodges, beach resorts, and boutique hotels in Kenya and Tanzania.',
          url: 'https://www.tembeaafrica.com/stays',
        }} />
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
    </Suspense>
  )
}
