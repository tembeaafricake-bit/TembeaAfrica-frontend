import { Suspense } from 'react'
import { FALLBACK_DESTINATIONS } from '@/lib/fallback-data'
import DestinationDetailClient from './DestinationDetailClient'
import type { Metadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/destinations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const slugs = Array.isArray(result?.data)
      ? result.data.map((item: any) => item.slug).filter((slug: unknown): slug is string => typeof slug === 'string')
      : []

    if (slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }))
    }
  } catch (error) {
    console.warn('Unable to fetch destination slugs for static generation:', error)
  }

  return FALLBACK_DESTINATIONS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let destinationData: any = null

  try {
    const response = await fetch(`${API_URL}/api/destinations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const raw = Array.isArray(result?.data) ? result.data : []
    destinationData = raw.find((item: any) => item.slug === slug || item._id === slug)
  } catch (error) {
    console.warn('Unable to fetch destination details for metadata:', error)
  }

  const fallback = FALLBACK_DESTINATIONS.find(item => item.slug === slug)
  const dest = destinationData || fallback

  if (!dest) {
    return {
      title: 'Destination Details | Tembea Africa',
      description: 'Explore beautiful African travel destinations.',
    }
  }

  const name = dest.name || 'Destination'
  const country = dest.country ? ` (${dest.country.charAt(0).toUpperCase() + dest.country.slice(1)})` : ''
  return {
    title: `${name}${country} Travel Guide & Safaris | Tembea Africa`,
    description: dest.description || `Plan your trip to ${name}. Discover available tours, accommodations, and guides.`,
    keywords: [name, dest.country, 'Africa travel', 'safari destination', 'tourism Africa'].filter(Boolean),
    alternates: {
      canonical: `/destinations/${slug}`,
    },
  }
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading destination details...</div>}>
      <DestinationDetailClient slug={slug} />
    </Suspense>
  )
}
