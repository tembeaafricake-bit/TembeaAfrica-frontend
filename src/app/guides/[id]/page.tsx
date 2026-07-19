import { Suspense } from 'react'
import { FALLBACK_GUIDES } from '@/lib/fallback-data'
import GuideDetailClient from './GuideDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/guides?limit=1000`, { cache: 'no-store' })
    const result = await response.json()
    const ids = Array.isArray(result?.data)
      ? result.data.map((guide: any) => ({ id: guide._id })).filter((item: any) => typeof item.id === 'string')
      : []
    return ids.length > 0 ? ids : FALLBACK_GUIDES.map(({ _id }) => ({ id: _id }))
  } catch (error) {
    console.warn('Unable to fetch guide IDs for static generation:', error)
    return FALLBACK_GUIDES.map(({ _id }) => ({ id: _id }))
  }
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading guide details...</div>}>
      <GuideDetailClient id={id} />
    </Suspense>
  )
}
