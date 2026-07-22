import { ToursClient } from '../ToursClient'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Kenya Safari Packages & Tours | Tembea Africa',
  description: 'Browse top-rated Kenya safari tour packages. Book Maasai Mara migration safaris, Amboseli elephant tours, and budget game drives.',
  keywords: ['Kenya safari packages', 'Kenya tours', 'safari packages Kenya', 'book Kenya safari', 'Tembea Africa'],
  alternates: { canonical: '/tours/kenya-safari-packages/' },
}

export default function KenyaSafariPackagesPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Best Kenya Safari Packages & Tours',
        description: 'Browse top-rated Kenya safari tour packages including Maasai Mara, Amboseli, and budget game drives.',
        url: 'https://www.tembeaafrica.com/tours/kenya-safari-packages',
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Kenya Safaris</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Kenya Safari Packages</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Explore handpicked Kenya safari packages, wildlife game drives, and wilderness lodge stays.</p>
        </div>
        <ToursClient overrideCategory="safari" overrideDestination="Kenya" />
      </main>
      <Footer />
    </>
  )
}
