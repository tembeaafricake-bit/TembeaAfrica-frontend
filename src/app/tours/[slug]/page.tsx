import { FALLBACK_TOURS } from '@/lib/fallback-data'
import TourDetailClient from './TourDetailClient'

export function generateStaticParams() {
  return FALLBACK_TOURS.map(({ slug }) => ({ slug }))
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <TourDetailClient slug={slug} />
}
