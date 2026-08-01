import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Kenya Airbnb & Airbnb-Style Stays | Tembea Africa',
  description: 'Find Airbnb-style stays, vacation rentals, serviced apartments, and boutique homes in Nairobi, Diani, Mombasa, Naivasha, and the Maasai Mara.',
  keywords: ['Kenya Airbnb', 'Airbnb Kenya', 'Airbnb-style stays', 'vacation rentals Kenya', 'serviced apartments Nairobi'],
  alternates: { canonical: 'https://www.tembeaafrica.com/airbnb-kenya/' },
}

export default function AirbnbKenyaPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Kenya Airbnb & Airbnb-Style Stays',
        description: 'Book Airbnb-style stays, vacation rentals, serviced apartments, and boutique homes in Kenya.',
        url: 'https://www.tembeaafrica.com/airbnb-kenya',
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <section className="bg-safari-gradient py-16 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Short stays, long memories</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Kenya Airbnb & Airbnb-Style Stays</h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Discover comfortable vacation rentals, boutique apartments, and private homes across Nairobi, Diani Beach, Mombasa, Naivasha, and Maasai Mara.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Stay close to the action</h2>
              <p className="text-gray-600">Choose apartments in Nairobi, beach homes in Diani, or secluded retreats near national parks.</p>
            </article>
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Great for families and groups</h2>
              <p className="text-gray-600">Enjoy more space, kitchen access, flexible check-in, and a home-like feel for longer stays.</p>
            </article>
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Book your perfect base</h2>
              <p className="text-gray-600">Pair your stay with safaris, transfers, and local guides for a seamless Kenya trip.</p>
            </article>
          </div>

          <div className="mt-10 rounded-2xl border border-safari-100 bg-safari-50 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Browse all stays and rentals</h2>
              <p className="text-gray-600 mt-2">From boutique hotels to self-catering homes, find the right stay for your trip.</p>
            </div>
            <Link href="/stays/" className="inline-flex items-center justify-center rounded-full bg-safari-600 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-700">
              Explore stays
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
