'use client'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, Search, Filter, Heart } from 'lucide-react'
import { destinationsApi } from '@/lib/api'
import { useWishlistStore } from '@/store'

const FALLBACK = [
  { _id: '1', name: 'Maasai Mara', slug: 'maasai-mara', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600', rating: 4.9, reviewCount: 1240, tourCount: 86, tags: ['Wildlife', 'Safari'], description: 'Home of the Great Wildebeest Migration.' },
  { _id: '2', name: 'Zanzibar', slug: 'zanzibar', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600', rating: 4.8, reviewCount: 890, tourCount: 54, tags: ['Beach', 'Culture'], description: 'Pristine beaches and Swahili culture.' },
  { _id: '3', name: 'Kilimanjaro', slug: 'kilimanjaro', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=600', rating: 4.9, reviewCount: 620, tourCount: 32, tags: ['Trekking', 'Mountain'], description: "Africa's highest peak at 5,895m." },
  { _id: '4', name: 'Serengeti', slug: 'serengeti', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=600', rating: 5.0, reviewCount: 1100, tourCount: 98, tags: ['Wildlife', 'Safari'], description: 'Endless plains and year-round wildlife.' },
  { _id: '5', name: 'Mombasa', slug: 'mombasa', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600', rating: 4.7, reviewCount: 980, tourCount: 71, tags: ['Beach', 'History'], description: "Kenya's vibrant coastal city." },
  { _id: '6', name: 'Diani Beach', slug: 'diani-beach', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', rating: 4.8, reviewCount: 560, tourCount: 38, tags: ['Beach', 'Snorkeling'], description: "Kenya's most celebrated beach." },
  { _id: '7', name: 'Ngorongoro', slug: 'ngorongoro', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1540202403-b7abd6747a18?w=600', rating: 4.9, reviewCount: 742, tourCount: 45, tags: ['Wildlife', 'Crater'], description: "World's largest intact volcanic caldera." },
  { _id: '8', name: 'Lamu', slug: 'lamu', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600', rating: 4.8, reviewCount: 320, tourCount: 28, tags: ['Culture', 'History'], description: 'Ancient Swahili town and UNESCO site.' },
  { _id: '9', name: 'Amboseli', slug: 'amboseli', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1551649001-7a2482d98d05?w=600', rating: 4.8, reviewCount: 410, tourCount: 34, tags: ['Wildlife', 'Elephants'], description: 'Elephants with Kilimanjaro backdrop.' },
  { _id: '10', name: 'Arusha', slug: 'arusha', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600', rating: 4.6, reviewCount: 280, tourCount: 52, tags: ['Gateway', 'Culture'], description: "Tanzania's safari gateway city." },
  { _id: '11', name: 'Naivasha', slug: 'naivasha', country: 'kenya', heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', rating: 4.7, reviewCount: 380, tourCount: 29, tags: ['Lake', 'Nature'], description: 'Flamingos and hippos on the Great Rift Valley lake.' },
  { _id: '12', name: 'Dar es Salaam', slug: 'dar-es-salaam', country: 'tanzania', heroImage: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600', rating: 4.5, reviewCount: 195, tourCount: 18, tags: ['City', 'Coastal'], description: "Tanzania's largest and most cosmopolitan city." },
]

const ALL_TAGS = ['All', 'Safari', 'Wildlife', 'Beach', 'Mountain', 'Trekking', 'Culture', 'History', 'Lake', 'City']

export function DestinationsClient() {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('all')
  const [activeTag, setActiveTag] = useState('All')
  const [sort, setSort] = useState('rating')
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const { data, isError, error } = useQuery({
    queryKey: ['all-destinations'],
    queryFn: () => destinationsApi.getAll().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
  
  if (isError) {
    console.error('Destinations query error:', error)
  }

  const destinations = (data?.data || FALLBACK) as typeof FALLBACK

  const filtered = useMemo(() => {
    let list = [...destinations]
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
    if (country !== 'all') list = list.filter(d => d.country === country)
    if (activeTag !== 'All') list = list.filter(d => (d.tags || []).some(t => t.toLowerCase().includes(activeTag.toLowerCase())))
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'reviews') list.sort((a, b) => b.reviewCount - a.reviewCount)
    else if (sort === 'tours') list.sort((a, b) => b.tourCount - a.tourCount)
    return list
  }, [destinations, search, country, activeTag, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Error Alert */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-200">Failed to load destinations. Showing available data.</p>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-8 flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none cursor-pointer">
          <option value="all">All countries</option>
          <option value="kenya">Kenya</option>
          <option value="tanzania">Tanzania</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none cursor-pointer">
          <option value="rating">Top rated</option>
          <option value="reviews">Most reviewed</option>
          <option value="tours">Most tours</option>
        </select>
      </div>

      {/* Tag pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${activeTag === tag ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-safari-300'}`}>
            {tag}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-6">{filtered.length} destination{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((dest, i) => (
          <motion.div key={dest._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 card-hover">
            <div className="relative h-44">
              <Link href={`/destinations/${dest.slug}`}>
                <Image src={dest.heroImage} alt={dest.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                  {(dest.tags || []).slice(0, 2).map(t => (
                    <span key={t} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full border border-white/30">{t}</span>
                  ))}
                </div>
              </Link>
              <button onClick={() => isInWishlist(dest._id) ? removeFromWishlist(dest._id) : addToWishlist(dest._id)}
                className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                <Heart className={`w-3.5 h-3.5 ${isInWishlist(dest._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full capitalize">
                {dest.country}
              </div>
            </div>
            <div className="p-4">
              <Link href={`/destinations/${dest.slug}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dest.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{dest.description}</p>
              </Link>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{dest.rating}</span>
                  <span>({dest.reviewCount.toLocaleString()})</span>
                </div>
                <span className="text-safari-600 font-medium">{dest.tourCount} tours</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/destinations/${dest.slug}`} className="flex-1 text-center py-2 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-xs font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">
                  Details
                </Link>
                  <Link href={`/tours?destination=${encodeURIComponent(dest.slug)}`} className="flex-1 text-center py-2 bg-safari-700 text-white rounded-xl text-xs font-medium hover:bg-safari-800 transition-colors">
                  Explore tours
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🌍</p>
          <p className="text-gray-500">No destinations match your filters. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
