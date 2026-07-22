import { StaysClient } from '../StaysClient'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels & Boutique Stays in Nairobi | Tembea Africa',
  description: 'Book the best hotels, luxury serviced apartments, and boutique BnBs in Nairobi. Browse listings in Karen, Westlands, and city center.',
  keywords: ['hotels in Nairobi', 'Nairobi hotels', 'BnB Nairobi', 'accommodation Nairobi', 'Tembea Africa'],
  alternates: { canonical: '/stays/hotels-in-nairobi/' },
}

export default function HotelsInNairobiPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Hotels & Boutique Stays in Nairobi',
        description: 'Browse the best hotels, luxury apartments, and boutique guest houses in Nairobi.',
        url: 'https://www.tembeaafrica.com/stays/hotels-in-nairobi',
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Nairobi Hotels</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Hotels in Nairobi</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Book boutique guest houses, premium BnBs, and luxury hotels in Nairobi.</p>
        </div>
        <StaysClient overrideSearch="Nairobi" />
      </main>
      <Footer />
    </>
  )
}
