'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Bus, Car, Plane, Ship, ShoppingCart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FALLBACK_TRANSPORT } from '@/lib/fallback-data'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, typeof Bus> = { bus: Bus, car: Car, flight: Plane, ferry: Ship }
const TYPES = ['all', 'bus', 'car', 'flight', 'ferry']

export default function TransportPage() {
  const [type, setType] = useState('all')
  const { addItem } = useCartStore()

  const handleCart = (transport: typeof FALLBACK_TRANSPORT[0]) => {
    addItem({
      id: transport._id,
      type: 'transport',
      name: `${transport.name} — Transport`,
      image: transport.image,
      price: transport.price,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: {
        type: transport.type,
        route: transport.route,
        duration: transport.duration,
      },
    })
    toast.success('Transport added to cart!')
  }

  const filtered = useMemo(() => {
    if (type === 'all') return FALLBACK_TRANSPORT
    return FALLBACK_TRANSPORT.filter(t => t.type === type)
  }, [type])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Get around Africa</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Transport</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Shuttles, car rentals, charter flights and ferries across Kenya and Tanzania.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize border transition-all ${type === t ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {t === 'all' ? 'All transport' : t === 'car' ? 'Car rental' : t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, i) => {
              const Icon = TYPE_ICONS[item.type] || Bus
              return (
                <motion.div key={item._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="relative h-40">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-safari-700" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.route}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div><span className="text-lg font-bold text-safari-700">${item.price}</span><span className="text-xs text-gray-400"> · {item.duration}</span></div>
                      <div className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" /><span>{item.rating}</span></div>
                    </div>
                    <button onClick={() => handleCart(item)} className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium bg-safari-700 text-white rounded-xl hover:bg-safari-800 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" /> Book
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
