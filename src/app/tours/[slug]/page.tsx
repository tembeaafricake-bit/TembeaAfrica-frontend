import { Suspense } from 'react'
import { FALLBACK_TOURS } from '@/lib/fallback-data'
import TourDetailClient from './TourDetailClient'
import type { Metadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/tours?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const slugs = Array.isArray(result?.data)
      ? result.data
          .map((item: any) => item.slug)
          .filter((slug: unknown): slug is string => typeof slug === 'string')
      : []

    if (slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }))
    }
  } catch (error) {
    console.warn('Unable to fetch tour slugs for static generation:', error)
  }

  return FALLBACK_TOURS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let tourData: any = null

  try {
    const response = await fetch(`${API_URL}/api/tours?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const raw = Array.isArray(result?.data) ? result.data : []
    tourData = raw.find((item: any) => item.slug === slug || item._id === slug)
  } catch (error) {
    console.warn('Unable to fetch tour details for metadata:', error)
  }

  const fallback = FALLBACK_TOURS.find(item => item.slug === slug)
  const tour = tourData || fallback

  if (!tour) {
    return {
      title: 'Tour & Safari Details | Tembea Africa',
      description: 'Book amazing African tours and safaris.',
    }
  }

  const title = tour.title || 'Tour & Safari'
  const destName = typeof tour.destination === 'string' ? tour.destination : (tour.destination?.name || '')
  const suffix = destName ? ` in ${destName}` : ''
  return {
    title: `${title}${suffix} | Tembea Africa`,
    description: tour.description || `Book the ${title}${suffix}. Check pricing, reviews, itinerary, and operator details.`,
    keywords: [title, destName, 'African safari tours', tour.category, 'Tembea Africa'].filter(Boolean),
    alternates: {
      canonical: `/tours/${slug}`,
    },
  }
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading tour...</div>}>
      <TourDetailClient slug={slug} />
    </Suspense>
  )
}
