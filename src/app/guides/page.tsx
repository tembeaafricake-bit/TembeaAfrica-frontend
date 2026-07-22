import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import GuidesClient from './GuidesClient'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local Safari Guides in Kenya & Tanzania | Tembea Africa',
  description: 'Book certified local guides for safaris, cultural tours, mountain treks, and city experiences across Kenya and Tanzania.',
  keywords: ['Kenya safari guide', 'Tanzania guide', 'local tour guide', 'Maasai Mara guide', 'Kilimanjaro guide'],
  alternates: { canonical: '/guides' },
}

export default function GuidesPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Local Guides in Kenya & Tanzania',
        description: 'Book certified local guides for safaris, cultural tours, mountain treks, and city experiences.',
        url: 'https://www.tembeaafrica.com/guides',
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Local expertise</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Expert local guides</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Connect with certified, experienced guides who know Africa's wild places better than anyone.
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading guides...</div>}>
          <GuidesClient />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
