import { Suspense } from 'react'
import DestinationDetailClient from '../[slug]/DestinationDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maasai Mara Travel Guide & Safaris | Tembea Africa',
  description: 'Plan your dream safari to Maasai Mara National Reserve. Browse best wildlife safari packages, luxury camps, and migration guides.',
  keywords: ['Maasai Mara', 'Kenya safari', 'wildebeest migration', 'African wildlife safari', 'Tembea Africa'],
  alternates: { canonical: '/destinations/maasai-mara/' },
}

export default function MaasaiMaraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading Maasai Mara details...</div>}>
      <DestinationDetailClient slug="maasai-mara-national-reserve" />
    </Suspense>
  )
}
