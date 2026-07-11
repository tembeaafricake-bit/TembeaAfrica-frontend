import { FALLBACK_STAYS } from '@/lib/fallback-data'
import StayDetailClient from './StayDetailClient'

export function generateStaticParams() {
  return FALLBACK_STAYS.map(({ slug }) => ({ slug }))
}

export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <StayDetailClient slug={slug} />
}
