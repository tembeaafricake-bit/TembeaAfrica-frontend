'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowLeft, ShoppingCart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { accommodationsApi } from '@/lib/api'
import { findStayBySlug } from '@/lib/fallback-data'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

export default function StayDetailClient({ slug }: { slug: string }) {
  const { addItem } = useCartStore()
  const searchParams = useSearchParams()
  const returnHref = (() => {
    const fromParam = searchParams.get('from')
    if (!fromParam) return '/stays'
    try {
      return decodeURIComponent(fromParam)
    } catch {
      return '/stays'
    }
  })()

  const { data, isLoading } = useQuery({
    queryKey: ['stay', slug],
    queryFn: async () => {
      try {
        const response = await accommodationsApi.getOne(slug)
        if (response?.data && (response.data._id || response.data.slug || response.data.name)) {
          return response.data
        }
      } catch {
        // fall back to search results if the direct lookup fails
      }

      const searchResponse = await accommodationsApi.getAll({ q: slug.replace(/-/g, ' '), limit: 20 })
      const list = Array.isArray(searchResponse?.data?.data) ? searchResponse.data.data : []
      return list.find((item: any) => item.slug === slug || item._id === slug) || null
    },
    retry: false,
  })

  const fallback = findStayBySlug(slug)
  const stay = data || fallback

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-safari-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading stay details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isLoading && !stay) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Stay not found</h1>
          <BackButton fallback={returnHref} label="Back to stays" className="text-safari-600 font-medium" />
        </main>
        <Footer />
      </>
    )
  }

  if (!stay) return null

  const image = stay.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'
  const destName = typeof stay.destination === 'object' && stay.destination
    ? (stay.destination as { name?: string }).name
    : (stay.destination as string)

  const handleBook = () => {
    addItem({
      id: stay._id,
      type: 'accommodation',
      name: stay.name,
      image,
      price: stay.pricePerNight,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: {
        type: stay.type,
        destination: destName,
        amenities: stay.amenities || [],
      },
    })
    toast.success('Added to cart!')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="relative h-72 md:h-96">
          <Image src={image} alt={stay.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
            <BackButton fallback={returnHref} label="All stays" className="inline-flex items-center gap-1 text-white/80 text-sm mb-3 hover:text-white" />
            <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full capitalize mb-2">{stay.type}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{stay.name}</h1>
            {destName && <p className="text-white/70 mt-2">{destName}</p>}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About this property</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{stay.description}</p>
              {stay.amenities && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {stay.amenities.map((a: string) => (
                    <span key={a} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div><span className="text-3xl font-bold text-safari-700">${stay.pricePerNight}</span><span className="text-sm text-gray-400">/night</span></div>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-golden-400 text-golden-400" /><span className="font-semibold">{stay.rating}</span></div>
              </div>
              <button onClick={handleBook} className="w-full flex items-center justify-center gap-2 py-3 bg-safari-700 text-white rounded-xl font-medium hover:bg-safari-800 transition-colors">
                <ShoppingCart className="w-4 h-4" /> Book now
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
