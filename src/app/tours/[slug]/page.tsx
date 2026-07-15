import { Suspense } from 'react'
import { FALLBACK_TOURS } from '@/lib/fallback-data'
import TourDetailClient from './TourDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/tours?limit=1000`, { cache: 'no-store' })
    const result = await response.json()
    const slugs = Array.isArray(result?.data)
      ? result.data.map((tour: any) => tour.slug).filter((slug: unknown) => typeof slug === 'string')
      : []

    if (slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }))
    }
  } catch (error) {
    console.warn('Unable to fetch tour slugs for static generation:', error)
  }

  return FALLBACK_TOURS.map(({ slug }) => ({ slug }))
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading tour...</div>}>
      <TourDetailClient slug={slug} />
    </Suspense>
  )
}
