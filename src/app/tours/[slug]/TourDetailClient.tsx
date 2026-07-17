'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Users, BadgeCheck, ShoppingCart, Heart, ArrowLeft, MapPin } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { toursApi } from '@/lib/api'
import { findTourBySlug } from '@/lib/fallback-data'
import { useCartStore, useWishlistStore } from '@/store'
import toast from 'react-hot-toast'

const getOperatorName = (operator: unknown) => {
  if (!operator) return 'Verified operator'
  if (typeof operator === 'string') return operator
  const firstName = (operator as { firstName?: string }).firstName || ''
  const lastName = (operator as { lastName?: string }).lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Verified operator'
}

const getDestinationName = (destination: unknown) => {
  if (!destination) return 'Unknown destination'
  if (typeof destination === 'string') return destination
  return (destination as { name?: string }).name || 'Unknown destination'
}

export default function TourDetailClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const { data, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: () => toursApi.getOne(slug).then(r => r.data),
    retry: false,
  })

  const fallback = findTourBySlug(slug)
  const tour = data || fallback
  const returnHref = (() => {
    const fromParam = searchParams.get('from')
    if (!fromParam) return '/tours'
    try {
      return decodeURIComponent(fromParam)
    } catch {
      return '/tours'
    }
  })()

  if (!isLoading && !tour) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 px-4 text-center">
          <p className="text-4xl mb-4">🦒</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tour not found</h1>
          <BackButton fallback={returnHref} label="Back to tours" className="text-safari-600 font-medium" />
        </main>
        <Footer />
      </>
    )
  }

  if (!tour) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading tour...</div>
        </main>
        <Footer />
      </>
    )
  }

  const image = tour.images?.[0] || 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800'
  const operatorName = getOperatorName(tour.operator)
  const destName = getDestinationName(tour.destination)
  const tourTags = Array.isArray(tour.tags) ? tour.tags : []
  const parseList = (value: unknown) => {
    if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item))
    if (typeof value === 'string') {
      return value
        .split(/\n|,/) 
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  const highlights = parseList(tour.highlights)
  const includes = parseList(tour.includes)
  const excludes = parseList(tour.excludes)
  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
    : typeof tour.itinerary === 'string'
      ? tour.itinerary.split(/\n/).map((line: string) => line.trim()).filter(Boolean)
      : []
  const summary = tour.description || tour.shortDescription || 'More details coming soon.'

  const handleBook = () => {
    addItem({
      id: tour._id,
      type: 'tour',
      name: tour.title,
      image,
      price: tour.price,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: {
        category: tour.category,
        duration: tour.duration,
        destination: destName,
        operator: operatorName,
      },
    })
    toast.success('Added to cart!')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="relative h-72 md:h-96">
          <Image src={image} alt={tour.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
            <BackButton fallback={returnHref} label="All tours" className="inline-flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white" />
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full capitalize mb-2">{tour.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{tour.title}</h1>
            {destName && (
              <p className="flex items-center gap-1 text-white/70 mt-2 text-sm"><MapPin className="w-4 h-4" />{destName}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About this tour</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>
            </div>

            {tourTags.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Perfect for</h2>
                <div className="flex flex-wrap gap-2">
                  {tourTags.map((tag: string) => (
                    <span key={tag} className="text-xs uppercase tracking-wide bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {itinerary.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Sample itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((item: any) => (
                    <div key={item.day} className="rounded-2xl bg-safari-50 dark:bg-safari-900/20 p-4">
                      <p className="text-sm font-semibold text-safari-700">Day {item.day}: {item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>
                      {item.activities?.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Activities:</span> {item.activities.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {highlights.map((h: string) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-safari-600" />{h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {includes.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">What&apos;s included</h2>
                <div className="flex flex-wrap gap-2">
                  {includes.map((item: string) => (
                    <span key={item} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-3 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {excludes.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">What&apos;s not included</h2>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  {excludes.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div><span className="text-3xl font-bold text-safari-700">${tour.price}</span><span className="text-sm text-gray-400">/person</span></div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-golden-400 text-golden-400" />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-xs text-gray-400">({tour.reviewCount})</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500 mb-5">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{tour.duration}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />Max {tour.groupSize} guests</div>
                <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-safari-600" />{operatorName}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleBook} className="flex-1 flex items-center justify-center gap-2 py-3 bg-safari-700 text-white rounded-xl font-medium hover:bg-safari-800 transition-colors">
                  <ShoppingCart className="w-4 h-4" /> Book now
                </button>
                <button onClick={() => isInWishlist(tour._id) ? removeFromWishlist(tour._id) : addToWishlist(tour._id)}
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-xl">
                  <Heart className={`w-5 h-5 ${isInWishlist(tour._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
