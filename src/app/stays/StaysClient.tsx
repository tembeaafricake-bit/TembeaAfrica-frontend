'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Search } from 'lucide-react'
import { accommodationsApi } from '@/lib/api'
import { FALLBACK_STAYS } from '@/lib/fallback-data'

function StaysContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') || 'all'
  const [type, setType] = useState(initialType)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('rating')

  const { data } = useQuery({
    queryKey: ['all-stays'],
    queryFn: () => accommodationsApi.getAll().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const allStays = (data?.data?.length ? data.data : FALLBACK_STAYS) as typeof FALLBACK_STAYS

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
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <Link href={`/stays/${stay.slug}`}>
              <div className="relative h-48">
                <Image src={stay.images[0]} alt={stay.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-2.5 py-1 rounded-full capitalize">{stay.type}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stay.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{stay.destination}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {stay.amenities.slice(0, 3).map(a => (
                    <span key={a} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div><span className="text-lg font-bold text-safari-700">${stay.pricePerNight}</span><span className="text-xs text-gray-400">/night</span></div>
                  <div className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" /><span className="font-semibold">{stay.rating}</span></div>
                </div>
              </div>
            </Link>
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
