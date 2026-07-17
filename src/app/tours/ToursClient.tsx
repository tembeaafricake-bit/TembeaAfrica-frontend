'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Clock, Users, BadgeCheck, Heart, ShoppingCart, SlidersHorizontal, X } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { FALLBACK_TOURS } from '@/lib/fallback-data'
import { useCartStore, useWishlistStore } from '@/store'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'safari', 'beach', 'mountain', 'adventure', 'cultural', 'city']
const CATEGORY_ALIASES: Record<string, string> = {
  wildlife: 'safari',
}
const CAT_COLORS: Record<string, string> = {
  safari: 'bg-green-100 text-green-700', beach: 'bg-blue-100 text-blue-700',
  mountain: 'bg-purple-100 text-purple-700', adventure: 'bg-orange-100 text-orange-700',
  cultural: 'bg-pink-100 text-pink-700', city: 'bg-gray-100 text-gray-700',
}

const normalizeCategory = (cat: string | null) => {
  if (!cat) return 'All'
  const lower = cat.toLowerCase()
  if (lower === 'all') return 'All'
  if (CATEGORY_ALIASES[lower]) return CATEGORY_ALIASES[lower]
  return CATEGORIES.find((item) => item.toLowerCase() === lower) || 'All'
}

const normalizeTour = (tour: any) => ({
  ...tour,
  operator: typeof tour.operator === 'string'
    ? tour.operator
    : tour.operator?.name || 'Unknown operator',
  verified: tour.verified ?? !!tour.operator?.verified,
  country: tour.country || tour.destination?.country || 'unknown',
  destination: typeof tour.destination === 'string'
    ? tour.destination
    : tour.destination?.name || 'Unknown destination',
})

const getDestinationName = (destination: unknown) => {
  if (!destination) return ''
  if (typeof destination === 'string') return destination
  return (destination as { name?: string }).name || ''
}

const getOperatorName = (operator: unknown) => {
  if (!operator) return ''
  if (typeof operator === 'string') return operator
  return (operator as { name?: string }).name || ''
}

function ToursContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(() => normalizeCategory(searchParams.get('category')))
  const [destinationFilter, setDestinationFilter] = useState(() => searchParams.get('destination') || '')
  const [country, setCountry] = useState('all')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sort, setSort] = useState('rating')
  const [instantOnly, setInstantOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    setCategory(normalizeCategory(cat))
    setDestinationFilter(searchParams.get('destination') || '')
  }, [searchParams])

  const setCategoryFilter = (cat: string) => {
    try {
      setCategory(cat)
      if (cat === 'All') {
        router.push('/tours')
      } else {
        router.push(`/tours?category=${encodeURIComponent(cat)}`)
      }
    } catch (e) {
      console.error('Navigation error:', e)
    }
  }

  const clearFilters = () => {
    setCategory('All')
    setCountry('all')
    setMaxPrice(5000)
    setInstantOnly(false)
    setVerifiedOnly(false)
    setDestinationFilter('')
    router.push('/tours')
  }

  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['all-tours'],
    queryFn: () => toursApi.getAll({ limit: 1000 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
  
  // Handle query errors
  if (isError) {
    console.error('Tours query error:', error)
  }
  
  const allTours = useMemo(() => {
    if (data?.data?.length) return data.data.map(normalizeTour)
    return FALLBACK_TOURS
  }, [data])

  const currentListUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (category !== 'All') params.set('category', category)
    if (country !== 'all') params.set('country', country)
    if (destinationFilter) params.set('destination', destinationFilter)
    if (sort && sort !== 'rating') params.set('sort', sort)
    if (instantOnly) params.set('instant', 'true')
    if (verifiedOnly) params.set('verified', 'true')
    return params.toString() ? `/tours?${params.toString()}` : '/tours'
  }, [category, country, destinationFilter, sort, instantOnly, verifiedOnly])

  const filtered = useMemo(() => {
    let list = [...allTours]
    if (category !== 'All') list = list.filter(t => t.category === category)
    if (country !== 'all') list = list.filter(t => t.country === country)
    if (destinationFilter) {
      list = list.filter(t => t.destination.toLowerCase().includes(destinationFilter.toLowerCase()))
    }
    list = list.filter(t => t.price <= maxPrice)
    if (instantOnly) list = list.filter(t => t.instantBooking)
    if (verifiedOnly) list = list.filter(t => t.verified)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'reviews') list.sort((a, b) => b.reviewCount - a.reviewCount)
    return list
  }, [allTours, category, destinationFilter, country, maxPrice, sort, instantOnly, verifiedOnly])

  const handleCart = (tour: typeof FALLBACK_TOURS[0]) => {
    addItem({
      id: tour._id,
      type: 'tour',
      name: tour.title,
      image: tour.images[0],
      price: tour.price,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: {
        category: tour.category,
        duration: tour.duration,
        destination: getDestinationName(tour.destination),
        operator: getOperatorName(tour.operator),
      },
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Error Alert */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-200">Failed to load tours. Showing available data.</p>
        </div>
      )}
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{filtered.length} tours found</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none">
            <option value="rating">Top rated</option>
            <option value="reviews">Most reviewed</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize border transition-all ${category === cat ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-safari-400'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {showFilters && (
          <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Country</label>
                {['all', 'kenya', 'tanzania'].map(c => (
                  <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="country" checked={country === c} onChange={() => setCountry(c)} className="text-safari-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">{c === 'all' ? 'All countries' : c}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Max price: ${maxPrice.toLocaleString()}</label>
                <input type="range" min={50} max={5000} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-safari-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$50</span><span>$5,000+</span></div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={instantOnly} onChange={e => setInstantOnly(e.target.checked)} className="rounded text-safari-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Instant booking only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded text-safari-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Verified operators only</span>
                </label>
              </div>
              <button onClick={() => { setCategory('All'); setCountry('all'); setMaxPrice(5000); setInstantOnly(false); setVerifiedOnly(false) }}
                className="w-full text-sm text-safari-600 font-medium py-2 border border-safari-200 rounded-xl hover:bg-safari-50 transition-colors">
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Tours grid */}
        <div className="flex-1 space-y-6">
          {destinationFilter && (
            <div className="p-4 bg-safari-50 dark:bg-safari-950/20 border border-safari-200 dark:border-safari-800 rounded-2xl flex items-center justify-between">
              <p className="text-sm text-safari-800 dark:text-safari-300">
                Showing tours in <span className="font-semibold">{destinationFilter}</span>
              </p>
              <button onClick={() => { setDestinationFilter(''); router.push('/tours') }}
                className="text-xs font-semibold text-safari-700 dark:text-safari-400 hover:underline">
                Show all destinations
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((tour, i) => (
              <motion.div key={tour._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Link href={`/tours/${tour.slug}?from=${encodeURIComponent(currentListUrl)}`}>
                    <Image src={tour.images[0]} alt={tour.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </Link>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${CAT_COLORS[tour.category] || 'bg-gray-100 text-gray-700'}`}>
                      {tour.category}
                    </span>
                  </div>
                  <button onClick={() => isInWishlist(tour._id) ? removeFromWishlist(tour._id) : addToWishlist(tour._id)}
                    className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist(tour._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  {tour.instantBooking && (
                    <span className="absolute bottom-3 left-3 bg-safari-700 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Instant
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <Link href={`/tours/${tour.slug}?from=${encodeURIComponent(currentListUrl)}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 hover:text-safari-700 mb-2">{tour.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    {tour.verified && <BadgeCheck className="w-3 h-3 text-safari-600" />}
                    <span>{tour.operator}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" /><span>{tour.duration}</span>
                    <span>·</span>
                    <Users className="w-3 h-3" /><span>Max {tour.groupSize}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div><span className="text-lg font-bold text-safari-700">${tour.price}</span><span className="text-xs text-gray-400">/pp</span></div>
                    <div className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" /><span className="font-semibold">{tour.rating}</span><span className="text-gray-400">({tour.reviewCount})</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/tours/${tour.slug}?from=${encodeURIComponent(currentListUrl)}`} className="flex-1 text-center py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:border-safari-400 transition-colors">
                      Details
                    </Link>
                    <button onClick={() => handleCart(tour)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-safari-700 text-white rounded-xl hover:bg-safari-800 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" /> Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-4xl mb-4">🦒</p>
                <p className="text-gray-500">No tours match your filters. Try adjusting them.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToursClient() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">Loading tours...</div>}>
      <ToursContent />
    </Suspense>
  )
}
