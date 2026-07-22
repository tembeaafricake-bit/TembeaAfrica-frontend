import { Suspense } from 'react'
import { FALLBACK_STAYS } from '@/lib/fallback-data'
import StayDetailClient from './StayDetailClient'
import type { Metadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/accommodations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const slugs = Array.isArray(result?.data)
      ? result.data.map((item: any) => item.slug).filter((slug: unknown) => typeof slug === 'string')
      : []

    if (slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }))
    }
  } catch (error) {
    console.warn('Unable to fetch accommodation slugs for static generation:', error)
  }

  return FALLBACK_STAYS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let stayData: any = null

  try {
    const response = await fetch(`${API_URL}/api/accommodations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const raw = Array.isArray(result?.data) ? result.data : []
    stayData = raw.find((item: any) => item.slug === slug || item._id === slug)
  } catch (error) {
    console.warn('Unable to fetch stay details for metadata:', error)
  }

  const fallback = FALLBACK_STAYS.find(item => item.slug === slug)
  const stay = stayData || fallback

  if (!stay) {
    return {
      title: 'Stay Details | Tembea Africa',
      description: 'Book luxury hotels, lodges, and BnBs in Africa.',
    }
  }

  const name = stay.name || 'Stay & Accommodation'
  const destName = typeof stay.destination === 'string' ? stay.destination : (stay.destination?.name || '')
  const suffix = destName ? ` in ${destName}` : ''
  return {
    title: `${name}${suffix} | Tembea Africa`,
    description: stay.description || `Book your stay at ${name}${suffix}. Browse rooms, amenities, prices, and reviews.`,
    keywords: [name, destName, 'African hotels', 'luxury lodge bnb', stay.type, 'Tembea Africa'].filter(Boolean),
    alternates: {
      canonical: `/stays/${slug}`,
    },
  }
}

export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading stay details...</div>}>
      <StayDetailClient slug={slug} />
    </Suspense>
  )
}
