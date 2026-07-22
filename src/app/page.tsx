import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/home/Hero'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedDestinations } from '@/components/home/FeaturedDestinations'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { AIBanner } from '@/components/home/AIBanner'
import { FeaturedGuides } from '@/components/home/FeaturedGuides'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FeaturedStays } from '@/components/home/FeaturedStays'
import { TrustStrip } from '@/components/home/TrustStrip'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tembea Africa | Kenya & Tanzania Safaris, Tours, Hotels & Guides',
  description: 'Book unforgettable Kenya and Tanzania safaris, beach tours, luxury stays, local guides, and transport with Tembea Africa.',
  keywords: ['Kenya safari', 'Tanzania safari', 'Maasai Mara safari', 'Zanzibar tours', 'Kilimanjaro trek', 'African travel'],
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name: 'Tembea Africa',
        url: 'https://www.tembeaafrica.com',
        description: 'Book safaris, tours, stays, guides, and transport in Kenya and Tanzania.',
        sameAs: ['https://www.facebook.com', 'https://www.instagram.com'],
      }} />
      <Navbar />
      <main>
        <Hero />
        <CategoryStrip />
        <FeaturedDestinations />
        <FeaturedTours />
        <AIBanner />
        <FeaturedStays />
        <FeaturedGuides />
        <TrustStrip />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
