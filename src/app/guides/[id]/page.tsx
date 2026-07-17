import { Suspense } from 'react'
import { FALLBACK_GUIDES } from '@/lib/fallback-data'
import GuideDetailClient from './GuideDetailClient'

export function generateStaticParams() {
  return FALLBACK_GUIDES.map(({ _id }) => ({ id: _id }))
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading guide details...</div>}>
      <GuideDetailClient id={id} />
    </Suspense>
  )
}
