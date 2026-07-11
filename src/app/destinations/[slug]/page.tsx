import { FALLBACK_DESTINATIONS } from '@/lib/fallback-data'
import DestinationDetailClient from './DestinationDetailClient'

export function generateStaticParams() {
  return FALLBACK_DESTINATIONS.map(({ slug }) => ({ slug }))
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <DestinationDetailClient slug={slug} />
}
