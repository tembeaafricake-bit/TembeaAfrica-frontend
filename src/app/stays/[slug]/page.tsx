import { Suspense } from 'react'
import { FALLBACK_STAYS } from '@/lib/fallback-data'
import StayDetailClient from './StayDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/accommodations?limit=1000`, { cache: 'no-store' })
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

export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading stay details...</div>}>
      <StayDetailClient slug={slug} />
    </Suspense>
  )
}
