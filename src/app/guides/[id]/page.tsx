import { FALLBACK_GUIDES } from '@/lib/fallback-data'
import GuideDetailClient from './GuideDetailClient'

export function generateStaticParams() {
  return FALLBACK_GUIDES.map(({ _id }) => ({ id: _id }))
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GuideDetailClient id={id} />
}
