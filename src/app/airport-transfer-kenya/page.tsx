import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Airport Transfers & Private Drivers in Kenya | Tembea Africa',
  description: 'Book airport transfers, private drivers, Nairobi airport pickups, and transport across Kenya and Tanzania for safaris, city travel, and beach getaways.',
  keywords: ['airport transfer Kenya', 'Nairobi airport transfer', 'private driver Kenya', 'airport pickup Kenya', 'Kenya transport'],
  alternates: { canonical: 'https://www.tembeaafrica.com/airport-transfer-kenya/' },
}

export default function AirportTransferKenyaPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Airport Transfers & Private Drivers in Kenya',
        description: 'Book airport transfers and private drivers across Kenya and Tanzania.',
        url: 'https://www.tembeaafrica.com/airport-transfer-kenya',
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <section className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Hassle-free arrival</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Airport Transfers & Private Drivers in Kenya</h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Arrive smoothly with airport pickups, private drivers, and reliable transport to Nairobi, Mombasa, Diani, Naivasha, and safari parks.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Airport pickup service</h2>
              <p className="text-gray-600">Meet-and-greet pickup at Jomo Kenyatta and Moi International Airports with direct transfers to your hotel or safari camp.</p>
            </article>
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Private and shared options</h2>
              <p className="text-gray-600">Choose from private cars, shared shuttles, and safari-ready vehicles based on your group size and route.</p>
            </article>
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Travel across Kenya confidently</h2>
              <p className="text-gray-600">Book transfers between cities, beaches, and national parks without the stress of arranging transport on the fly.</p>
            </article>
          </div>

          <div className="mt-10 rounded-2xl border border-safari-100 bg-safari-50 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Browse all transport options</h2>
              <p className="text-gray-600 mt-2">Find airport pickups, shuttles, private drivers, and safari vehicles in one place.</p>
            </div>
            <Link href="/transport/" className="inline-flex items-center justify-center rounded-full bg-safari-600 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-700">
              Explore transport
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
