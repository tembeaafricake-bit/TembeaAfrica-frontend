import { Suspense } from 'react'
import TourDetailClient from './TourDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'

export function generateStaticParams() {
  return [{ slug: 'maasai-mara-big-five-5day' }]
}

export const dynamicParams = false

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-gray-400">Loading tour...</div>}>
      <TourDetailClient slug={slug} />
    </Suspense>
  )
}
