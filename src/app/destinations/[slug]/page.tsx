import { Suspense } from 'react'
import { FALLBACK_DESTINATIONS } from '@/lib/fallback-data'
import DestinationDetailClient from './DestinationDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/destinations?limit=1000`, { cache: 'no-store' })
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

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading destination details...</div>}>
      <DestinationDetailClient slug={slug} />
    </Suspense>
  )
}
