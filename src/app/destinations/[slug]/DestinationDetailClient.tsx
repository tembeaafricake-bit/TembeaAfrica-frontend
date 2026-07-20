'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { destinationsApi, toursApi } from '@/lib/api'
import { findDestinationBySlug } from '@/lib/fallback-data'

export default function DestinationDetailClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const returnHref = (() => {
    const fromParam = searchParams.get('from')
    if (!fromParam) return '/destinations'
    try {
      return decodeURIComponent(fromParam)
    } catch {
      return '/destinations'
    }
  })()

  const { data, isLoading } = useQuery({
    queryKey: ['destination', slug],
    queryFn: () => destinationsApi.getOne(slug).then(r => r.data),
    retry: false,
  })

  const { data: toursData } = useQuery({
    queryKey: ['destination-tours', slug],
    queryFn: () => toursApi.getAll({ q: slug.replace(/-/g, ' '), limit: 6 }).then(r => r.data),
    enabled: !!slug,
  })

  const fallback = findDestinationBySlug(slug)
  const dest = data || fallback

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-safari-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading destination details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isLoading && !dest) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 px-4 text-center">
          <p className="text-4xl mb-4">🌍</p>
          <h1 className="text-2xl font-bold mb-2">Destination not found</h1>
          <BackButton fallback={returnHref} label="Back to destinations" className="text-safari-600 font-medium" />
        </main>
        <Footer />
      </>
    )
  }

  if (!dest) return null

  const relatedTours = toursData?.data?.slice(0, 4) || []
  const heroImg = dest.heroImage || 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200'

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="relative h-72 md:h-[420px]">
          <Image src={heroImg} alt={dest.name || 'Destination'} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
            <BackButton fallback={returnHref} label="All destinations" className="inline-flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white" />
            <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full capitalize mb-2">{dest.country}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">{dest.name || 'Unnamed Destination'}</h1>
            <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-golden-400 text-golden-400" />{dest.rating ?? 0} ({(dest.reviewCount ?? 0).toLocaleString()} reviews)</span>
              <span>{dest.tourCount ?? 0} tours available</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Overview</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{dest.description || 'No description available.'}</p>
              {dest.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(() => {
                    const rawTags = dest.tags as any
                    const tagsArray = Array.isArray(rawTags)
                      ? rawTags
                      : typeof rawTags === 'string'
                        ? rawTags.split(',').map((t: string) => t.trim())
                        : []
                    return tagsArray.map((t: any) => (
                      <span key={t} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-3 py-1 rounded-full">{t}</span>
                    ))
                  })()}
                </div>
              )}
            </div>
            {relatedTours.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tours in {dest.name}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedTours.map((tour: { _id: string; slug: string; title: string; price: number; images?: string[] }) => (
                    <Link key={tour._id} href={`/tours/${tour.slug}?from=${encodeURIComponent(`/destinations/${slug}`)}`} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={tour.images?.[0] || dest.heroImage} alt={tour.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{tour.title}</p>
                        <p className="text-sm text-safari-700 font-bold mt-1">${tour.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/tours?category=safari" className="inline-block mt-4 text-sm text-safari-600 font-medium">View all tours →</Link>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {dest.bestTimeToVisit && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <Calendar className="w-4 h-4 text-safari-600" /> Best time to visit
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{dest.bestTimeToVisit}</p>
              </div>
            )}
            {dest.travelTips && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <MapPin className="w-4 h-4 text-safari-600" /> Travel tips
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{dest.travelTips}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
