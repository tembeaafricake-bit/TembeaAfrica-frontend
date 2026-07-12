'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Clock, Users, Heart, ArrowRight, BadgeCheck } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { useCartStore, useWishlistStore } from '@/store'
import { Tour } from '@/types'
import toast from 'react-hot-toast'

const FALLBACK_TOURS = [
  { _id: 't1', title: '5-Day Maasai Mara Safari — Big Five Guaranteed', slug: 'maasai-mara-big-five-5day', description: 'Witness the greatest wildlife spectacle on earth.', destination: { name: 'Maasai Mara', slug: 'maasai-mara' }, category: 'safari', images: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600'], price: 480, currency: 'USD', duration: '5 days', groupSize: 8, rating: 4.9, reviewCount: 312, featured: true, operator: { name: 'Mara Safaris', verified: true, rating: 4.9 }, instantBooking: true, includes: [], excludes: [], itinerary: [], availability: [] },
  { _id: 't2', title: 'Zanzibar Island Dhow Cruise & Spice Tour', slug: 'zanzibar-dhow-cruise-spice', description: 'Sail on a traditional dhow and explore spice farms.', destination: { name: 'Zanzibar', slug: 'zanzibar' }, category: 'beach', images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600'], price: 75, currency: 'USD', duration: '1 day', groupSize: 12, rating: 4.8, reviewCount: 197, featured: true, operator: { name: 'Zanzibar Xplore', verified: true, rating: 4.8 }, instantBooking: true, includes: [], excludes: [], itinerary: [], availability: [] },
  { _id: 't3', title: 'Mount Kilimanjaro Summit Trek — 7 Days Machame Route', slug: 'kilimanjaro-machame-7day', description: 'Conquer Africa\'s highest peak via the scenic Machame route.', destination: { name: 'Kilimanjaro', slug: 'kilimanjaro' }, category: 'mountain', images: ['https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=600'], price: 1850, currency: 'USD', duration: '7 days', groupSize: 6, rating: 4.9, reviewCount: 88, featured: true, operator: { name: 'Kili Climbers', verified: true, rating: 4.9 }, instantBooking: false, includes: [], excludes: [], itinerary: [], availability: [] },
  { _id: 't4', title: 'Serengeti Great Migration Safari — Private Vehicle', slug: 'serengeti-migration-private', description: 'Chase the wildebeest migration across the endless Serengeti plains.', destination: { name: 'Serengeti', slug: 'serengeti' }, category: 'safari', images: ['https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=600'], price: 960, currency: 'USD', duration: '4 days', groupSize: 4, rating: 5.0, reviewCount: 143, featured: true, operator: { name: 'Tanzania Wild', verified: true, rating: 5.0 }, instantBooking: true, includes: [], excludes: [], itinerary: [], availability: [] },
  { _id: 't5', title: 'Nairobi National Park Half-Day Morning Safari', slug: 'nairobi-national-park-halfday', description: 'Spot lions and giraffes with the Nairobi skyline as a backdrop.', destination: { name: 'Nairobi', slug: 'nairobi' }, category: 'safari', images: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600'], price: 95, currency: 'USD', duration: '4 hours', groupSize: 8, rating: 4.7, reviewCount: 254, featured: false, operator: { name: 'Nairobi Safaris', verified: true, rating: 4.7 }, instantBooking: true, includes: [], excludes: [], itinerary: [], availability: [] },
  { _id: 't6', title: 'Diani Beach Snorkeling & Marine Park Excursion', slug: 'diani-snorkeling-marine-park', description: 'Explore vibrant coral reefs and swim with sea turtles.', destination: { name: 'Diani', slug: 'diani-beach' }, category: 'beach', images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'], price: 65, currency: 'USD', duration: '1 day', groupSize: 10, rating: 4.8, reviewCount: 189, featured: false, operator: { name: 'Diani Dive', verified: false, rating: 4.8 }, instantBooking: true, includes: [], excludes: [], itinerary: [], availability: [] },
]

const CATEGORY_COLORS: Record<string, string> = {
  safari: 'bg-safari-100 text-safari-700',
  beach: 'bg-blue-100 text-blue-700',
  mountain: 'bg-purple-100 text-purple-700',
  adventure: 'bg-orange-100 text-orange-700',
  cultural: 'bg-pink-100 text-pink-700',
  city: 'bg-gray-100 text-gray-700',
}

export function FeaturedTours() {
  const { data } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: () => toursApi.getFeatured().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const tours: Tour[] = (data?.data?.length ? data.data : FALLBACK_TOURS) as unknown as Tour[]

  const handleAddToCart = (tour: Tour) => {
    addItem({
      id: tour._id,
      type: 'tour',
      name: tour.title,
      image: tour.images[0],
      price: tour.price,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: { duration: tour.duration, category: tour.category },
    })
    toast.success('Added to cart!')
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-safari-600 text-sm font-medium uppercase tracking-wide mb-2">Hand-picked experiences</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Top-rated tours & safaris</h2>
          </div>
          <Link href="/tours" className="flex items-center gap-2 text-safari-600 text-sm font-medium hover:gap-3 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.slice(0, 6).map((tour, i) => (
            <motion.div key={tour._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow card-hover">
              <div className="relative h-52 overflow-hidden">
                <Link href={`/tours/${tour.slug}`}>
                  <Image src={tour.images[0]} alt={tour.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </Link>
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${CATEGORY_COLORS[tour.category] || 'bg-gray-100 text-gray-700'}`}>
                    {tour.category}
                  </span>
                </div>
                <button onClick={() => isInWishlist(tour._id) ? removeFromWishlist(tour._id) : addToWishlist(tour._id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <Heart className={`w-4 h-4 ${isInWishlist(tour._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                {tour.instantBooking && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-safari-700 text-white text-xs px-2 py-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> Instant booking
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link href={`/tours/${tour.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-safari-700 transition-colors">
                    {tour.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {(tour.operator as any)?.verified && <BadgeCheck className="w-3 h-3 text-safari-600" />}
                  <span>{(tour.operator as any)?.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tour.duration}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Up to {tour.groupSize}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-safari-700">${tour.price}</span>
                    <span className="text-xs text-gray-400 ml-1">/ person</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-golden-400 text-golden-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{tour.rating}</span>
                    <span className="text-gray-400">({tour.reviewCount})</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link href={`/tours/${tour.slug}`}
                    className="flex-1 text-center py-2 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-sm font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">
                    View details
                  </Link>
                  <button onClick={() => handleAddToCart(tour)}
                    className="flex-1 py-2 bg-safari-700 text-white rounded-xl text-sm font-medium hover:bg-safari-800 transition-colors">
                    Add to cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
