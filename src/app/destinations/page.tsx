import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DestinationsClient } from './DestinationsClient'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top Destinations in Kenya & Tanzania | Tembea Africa',
  description: 'Discover top travel destinations in Kenya and Tanzania, including Maasai Mara, Zanzibar, Kilimanjaro, Serengeti, Diani Beach, and more.',
  keywords: ['Kenya destinations', 'Tanzania destinations', 'Maasai Mara', 'Zanzibar travel', 'Serengeti safari', 'Diani Beach'],
  alternates: { canonical: '/destinations' },
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading destinations...</div>}>
      <>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Top Destinations in Kenya & Tanzania',
          description: 'Discover travel destinations such as Maasai Mara, Zanzibar, Kilimanjaro, Serengeti, and Diani Beach.',
          url: 'https://www.tembeaafrica.com/destinations',
        }} />
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Africa awaits</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Explore Destinations</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            From the wild savannas of Kenya to Tanzania's stunning coast — discover Africa's most breathtaking places.
          </p>
        </div>
        <DestinationsClient />
      </main>
      <Footer />
    </>
    </Suspense>
  )
}
