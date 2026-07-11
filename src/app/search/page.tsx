'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Compass, UserCheck, BedDouble } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FALLBACK_TOURS, FALLBACK_DESTINATIONS, FALLBACK_GUIDES, FALLBACK_STAYS } from '@/lib/fallback-data'

function SearchContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const q = query.toLowerCase().trim()
  const tours = q ? FALLBACK_TOURS.filter(t => t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)) : FALLBACK_TOURS.slice(0, 4)
  const destinations = q ? FALLBACK_DESTINATIONS.filter(d => d.name.toLowerCase().includes(q)) : FALLBACK_DESTINATIONS.slice(0, 4)
  const guides = q ? FALLBACK_GUIDES.filter(g => g.name.toLowerCase().includes(q)) : FALLBACK_GUIDES.slice(0, 3)
  const stays = q ? FALLBACK_STAYS.filter(s => s.name.toLowerCase().includes(q)) : FALLBACK_STAYS.slice(0, 3)
  const total = tours.length + destinations.length + guides.length + stays.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-8 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search tours, destinations, guides, stays..." value={query} onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" autoFocus />
      </div>

      {q && <p className="text-sm text-gray-500 mb-6">{total} results for &ldquo;{query}&rdquo;</p>}

      {tours.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4"><Compass className="w-4 h-4 text-safari-600" /><h2 className="font-semibold text-gray-900 dark:text-white">Tours</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tours.map(t => (
              <Link key={t._id} href={`/tours/${t.slug}`} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-safari-300 transition-colors">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{t.title}</p>
                <p className="text-sm text-safari-700 font-bold mt-1">${t.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {destinations.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-safari-600" /><h2 className="font-semibold text-gray-900 dark:text-white">Destinations</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {destinations.map(d => (
              <Link key={d._id} href={`/destinations/${d.slug}`} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-safari-300 transition-colors">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{d.country}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4"><UserCheck className="w-4 h-4 text-safari-600" /><h2 className="font-semibold text-gray-900 dark:text-white">Guides</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guides.map(g => (
              <Link key={g._id} href={`/guides/${g._id}`} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-safari-300 transition-colors">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{g.name}</p>
                <p className="text-sm text-safari-700 font-bold mt-1">${g.dailyRate}/day</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {stays.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4"><BedDouble className="w-4 h-4 text-safari-600" /><h2 className="font-semibold text-gray-900 dark:text-white">Stays</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stays.map(s => (
              <Link key={s._id} href={`/stays/${s.slug}`} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-safari-300 transition-colors">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-sm text-safari-700 font-bold mt-1">${s.pricePerNight}/night</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && q && (
        <div className="text-center py-20"><p className="text-gray-500">No results found. Try a different search term.</p></div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-12 px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Search</h1>
        </div>
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
