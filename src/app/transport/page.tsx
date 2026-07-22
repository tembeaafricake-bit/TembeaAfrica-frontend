import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TransportClient } from './TransportClient'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Car Rentals, Shuttles & Transport in Kenya & Tanzania | Tembea Africa',
  description: 'Book private car rentals, intercity shuttles, safari land cruisers, charter flights, and ferry transfers across Kenya and Tanzania.',
  keywords: ['Kenya car rental', 'Tanzania airport shuttle', 'safari land cruiser hire', 'Mombasa ferry transfer', 'Nairobi private driver'],
  alternates: { canonical: '/transport' },
}

export default function TransportPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading transport options...</div>}>
      <>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Car Rentals, Shuttles & Transport in Kenya & Tanzania',
          description: 'Book private car rentals, safari land cruisers, shuttles, flights, and ferry transfers in Kenya and Tanzania.',
          url: 'https://www.tembeaafrica.com/transport',
        }} />
        <Navbar />
        <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
          <div className="bg-safari-gradient py-14 px-4 text-center">
            <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Get around Africa</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Transport & Car Rentals</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">Shuttles, private rentals, charter flights, and ferries across Kenya and Tanzania.</p>
          </div>
          <TransportClient />
        </main>
        <Footer />
      </>
    </Suspense>
  )
}
