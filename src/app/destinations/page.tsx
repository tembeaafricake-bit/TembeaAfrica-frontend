import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DestinationsClient } from './DestinationsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Destinations — Kenya & Tanzania',
  description: 'Explore top travel destinations across Kenya and Tanzania. Maasai Mara, Zanzibar, Kilimanjaro, Serengeti and more.',
}

export default function DestinationsPage() {
  return (
    <>
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
  )
}
