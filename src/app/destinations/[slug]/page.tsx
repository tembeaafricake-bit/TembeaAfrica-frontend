import { Suspense } from 'react'
import { FALLBACK_DESTINATIONS } from '@/lib/fallback-data'
import DestinationDetailClient from './DestinationDetailClient'

export function generateStaticParams() {
  return FALLBACK_DESTINATIONS.map(({ slug }) => ({ slug }))
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading destination details...</div>}>
      <DestinationDetailClient slug={slug} />
    </Suspense>
  )
}
