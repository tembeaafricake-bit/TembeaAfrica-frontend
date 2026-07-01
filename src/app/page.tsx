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
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tembea Africa — Discover. Book. Explore Africa.',
  description: "Africa's leading travel marketplace. Book safaris, hotels, guides, and tours across Kenya and Tanzania.",
}

export default function HomePage() {
  return (
    <>
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
