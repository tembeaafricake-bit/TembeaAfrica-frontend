'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowRight, Heart } from 'lucide-react'
import { destinationsApi } from '@/lib/api'
import { useWishlistStore } from '@/store'
import { Destination } from '@/types'

const FALLBACK_DESTINATIONS = [
  { _id: '1', name: 'Maasai Mara', slug: 'maasai-mara', country: 'kenya', description: 'Home of the Great Wildebeest Migration and Africa\'s finest wildlife.', heroImage: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800', rating: 4.9, reviewCount: 1240, tourCount: 86, hotelCount: 45, tags: ['Wildlife', 'Safari', 'Migration'], bestTimeToVisit: 'Jul–Oct', featured: true, images: [], coordinates: { lat: -1.5, lng: 35.1 } },
  { _id: '2', name: 'Zanzibar', slug: 'zanzibar', country: 'tanzania', description: 'Pristine white beaches, turquoise waters, and rich Swahili culture.', heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', rating: 4.8, reviewCount: 890, tourCount: 54, hotelCount: 120, tags: ['Beach', 'Culture', 'Diving'], bestTimeToVisit: 'Jun–Oct', featured: true, images: [], coordinates: { lat: -6.1, lng: 39.2 } },
  { _id: '3', name: 'Kilimanjaro', slug: 'kilimanjaro', country: 'tanzania', description: 'Africa\'s highest peak. The ultimate trekking challenge at 5,895m.', heroImage: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=800', rating: 4.9, reviewCount: 620, tourCount: 32, hotelCount: 28, tags: ['Trekking', 'Adventure', 'Mountain'], bestTimeToVisit: 'Jan–Mar, Jun–Oct', featured: true, images: [], coordinates: { lat: -3.1, lng: 37.4 } },
  { _id: '4', name: 'Serengeti', slug: 'serengeti', country: 'tanzania', description: 'Endless plains, the world\'s greatest wildlife spectacle, year-round.', heroImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800', rating: 5.0, reviewCount: 1100, tourCount: 98, hotelCount: 62, tags: ['Wildlife', 'Safari', 'Photography'], bestTimeToVisit: 'Jun–Sep', featured: true, images: [], coordinates: { lat: -2.3, lng: 34.8 } },
  { _id: '5', name: 'Mombasa', slug: 'mombasa', country: 'kenya', description: 'Kenya\'s vibrant coastal city with old town charm and beautiful beaches.', heroImage: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800', rating: 4.7, reviewCount: 980, tourCount: 71, hotelCount: 134, tags: ['Beach', 'History', 'Culture'], bestTimeToVisit: 'Oct–Apr', featured: true, images: [], coordinates: { lat: -4.0, lng: 39.7 } },
  { _id: '6', name: 'Diani Beach', slug: 'diani-beach', country: 'kenya', description: 'Kenya\'s most celebrated beach — powder white sand and coral reefs.', heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', rating: 4.8, reviewCount: 560, tourCount: 38, hotelCount: 67, tags: ['Beach', 'Snorkeling', 'Relaxation'], bestTimeToVisit: 'Dec–Apr', featured: true, images: [], coordinates: { lat: -4.3, lng: 39.6 } },
]

export function FeaturedDestinations() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-destinations'],
    queryFn: () => destinationsApi.getFeatured().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const destinations: Destination[] = (data?.data?.length ? data.data : FALLBACK_DESTINATIONS) as Destination[]

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-safari-600 text-sm font-medium uppercase tracking-wide mb-2">Explore Africa</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Popular destinations</h2>
          </div>
          <Link href="/destinations" className="flex items-center gap-2 text-safari-600 text-sm font-medium hover:gap-3 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest, i) => (
            <motion.div key={dest._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 card-hover cursor-pointer">
              <Link href={`/destinations/${dest.slug}`}>
                <div className="relative h-56 overflow-hidden">
                  <Image src={dest.heroImage} alt={dest.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30 capitalize">
                      {dest.country}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-1">{dest.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{dest.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Star className="w-4 h-4 fill-golden-400 text-golden-400" />
                      <span className="font-medium">{dest.rating}</span>
                      <span className="text-gray-400">·</span>
                      <span>{dest.reviewCount.toLocaleString()} reviews</span>
                    </div>
                    <span className="text-safari-600 text-sm font-medium">{dest.tourCount} tours</span>
                  </div>
                </div>
              </Link>
              <button onClick={(e) => { e.preventDefault(); isInWishlist(dest._id) ? removeFromWishlist(dest._id) : addToWishlist(dest._id) }}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                <Heart className={`w-4 h-4 ${isInWishlist(dest._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
