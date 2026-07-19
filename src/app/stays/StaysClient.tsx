'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Search, ShoppingCart } from 'lucide-react'
import { accommodationsApi } from '@/lib/api'
import { FALLBACK_STAYS } from '@/lib/fallback-data'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const getDestinationName = (destination: unknown) => {
  if (!destination) return 'Unknown destination'
  if (typeof destination === 'string') return destination
  if (typeof destination === 'object') {
    const maybe = destination as { name?: string; slug?: string; toString?: () => string }
    if (typeof maybe.name === 'string' && maybe.name.trim()) return maybe.name
    if (typeof maybe.slug === 'string' && maybe.slug.trim()) return maybe.slug
    if (typeof maybe.toString === 'function') {
      const str = maybe.toString()
      if (str !== '[object Object]') return str
    }
  }
  return 'Unknown destination'
}

const normalizeStay = (stay: any) => {
  const destName = getDestinationName(stay.destination)
  const displayName = typeof stay.name === 'string' && stay.name.trim()
    ? stay.name.trim()
    : typeof stay.title === 'string' && stay.title.trim()
      ? stay.title.trim()
      : 'Untitled stay'
  return {
    ...stay,
    name: displayName,
    destination: destName,
    images: Array.isArray(stay.images) && stay.images.length > 0
      ? stay.images
      : stay.heroImage
        ? [stay.heroImage]
        : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
  }
}

function StaysContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialType = searchParams.get('type') || 'all'
  const initialSearch = searchParams.get('search') || ''
  const initialSort = searchParams.get('sort') || 'rating'
  const [type, setType] = useState(initialType)
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState(initialSort)

  useEffect(() => {
    const params = new URLSearchParams()
    if (type && type !== 'all') params.set('type', type)
    if (search) params.set('search', search)
    if (sort && sort !== 'rating') params.set('sort', sort)
    const target = params.toString() ? `/stays?${params.toString()}` : '/stays'

    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== target) {
      router.replace(target)
    }
  }, [type, search, sort, router])

  const currentListUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (type && type !== 'all') params.set('type', type)
    if (search) params.set('search', search)
    if (sort && sort !== 'rating') params.set('sort', sort)
    return params.toString() ? `/stays?${params.toString()}` : '/stays'
  }, [search, sort, type])
  const { addItem } = useCartStore()

  const handleBookStay = (stay: any) => {
    addItem({
      id: stay._id,
      type: 'accommodation',
      name: stay.name,
      image: stay.images?.[0] || '',
      price: stay.pricePerNight,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: {
        type: stay.type,
        destination: stay.destination,
      },
    })
    toast.success('Stay added to cart!')
  }

  const { data } = useQuery({
    queryKey: ['all-stays'],
    queryFn: () => accommodationsApi.getAll({ limit: 1000 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  // Restore scroll position when returning to a previously-saved list URL
  useEffect(() => {
    try {
      const key = `stays-scroll:${currentListUrl}`
      const v = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null
      if (v) {
        window.scrollTo({ top: Number(v), behavior: 'auto' })
        sessionStorage.removeItem(key)
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [currentListUrl])

  const allStays = useMemo(() => {
    const list = data?.data?.length ? data.data : FALLBACK_STAYS
    return list.map(normalizeStay)
  }, [data])

  const filtered = useMemo(() => {
    let list = [...allStays]
    if (type !== 'all') list = list.filter(s => s.type === type)
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.destination.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'price-asc') list.sort((a, b) => a.pricePerNight - b.pricePerNight)
    else if (sort === 'price-desc') list.sort((a, b) => b.pricePerNight - a.pricePerNight)
    return list
  }, [allStays, type, search, sort])

  const TYPES = ['all', 'hotel', 'lodge', 'bnb', 'resort', 'villa']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search stays..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer text-gray-700 dark:text-gray-200 border-0">
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize border transition-all ${type === t ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {t === 'all' ? 'All stays' : t === 'bnb' ? 'BnBs' : t}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-5">{filtered.length} stays found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((stay, i) => (
          <motion.div key={stay._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
                <Link href={`/stays/${stay.slug || stay._id}?from=${encodeURIComponent(currentListUrl)}`} onClick={() => {
                  try { sessionStorage.setItem(`stays-scroll:${currentListUrl}`, String(window.scrollY)) } catch {}
                }}>
                <div className="relative h-44">
                  <Image src={stay.images[0]} alt={stay.name} fill className="object-cover" />
                  <span className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-2.5 py-1 rounded-full capitalize">{stay.type}</span>
                </div>
                <div className="p-4 pb-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stay.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{stay.destination}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {stay.amenities.slice(0, 3).map((a: string) => (
                      <span key={a} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div><span className="text-lg font-bold text-safari-700">${stay.pricePerNight}</span><span className="text-xs text-gray-400">/night</span></div>
                    <div className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" /><span className="font-semibold">{stay.rating}</span></div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="p-4 pt-3 flex gap-2">
              <Link href={`/stays/${stay.slug || stay._id}?from=${encodeURIComponent(currentListUrl)}`} className="flex-1 text-center py-2 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-xs font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">
                Details
              </Link>
              <button onClick={() => handleBookStay(stay)} className="flex-1 py-2 bg-safari-700 text-white rounded-xl text-xs font-medium hover:bg-safari-800 transition-colors">
                Book
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20"><p className="text-gray-500">No stays match your filters.</p></div>
      )}
    </div>
  )
}

export function StaysClient() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">Loading stays...</div>}>
      <StaysContent />
    </Suspense>
  )
}
