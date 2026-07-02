'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react'

const DESTINATIONS = ['Maasai Mara, Kenya', 'Zanzibar, Tanzania', 'Serengeti, Tanzania',
  'Kilimanjaro, Tanzania', 'Mombasa, Kenya', 'Nairobi, Kenya', 'Diani, Kenya', 'Ngorongoro, Tanzania']

const CATEGORIES = ['All', 'Safaris', 'Hotels & Lodges', 'BnBs & Villas', 'Adventures', 'Beach Escapes', 'Guides', 'Transport']

export function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [guests, setGuests] = useState(2)
  const [dates, setDates] = useState('')

  const suggestions = DESTINATIONS.filter(d => d.toLowerCase().includes(query.toLowerCase()))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category !== 'All') params.set('category', category)
    if (guests) params.set('guests', guests.toString())
    if (dates) params.set('dates', dates)

    if (category === 'Safaris' || category === 'Adventures') {
      router.push(`/tours?${params.toString()}`)
    } else if (category === 'Hotels & Lodges' || category === 'BnBs & Villas') {
      router.push(`/stays?${params.toString()}`)
    } else if (category === 'Guides') {
      router.push(`/guides?${params.toString()}`)
    } else {
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image src="https://res.cloudinary.com/doxwolgpe/image/upload/v1781763818/TembeaAfricaHS3_mriji0.png" alt="Tembea Africa Hero" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Animated landscape SVG */}
      <div className="absolute bottom-0 left-0 right-0 opacity-30">
        <svg viewBox="0 0 1440 300" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 200 Q200 120 400 180 Q600 240 800 160 Q1000 80 1200 140 Q1320 170 1440 120 L1440 300 L0 300Z" fill="#2D6A4F" />
          <path d="M0 240 Q360 180 720 220 Q1080 260 1440 200 L1440 300 L0 300Z" fill="#1B4332" />
          {/* Trees */}
          <rect x="120" y="160" width="6" height="60" fill="#1B4332" />
          <ellipse cx="123" cy="160" rx="28" ry="22" fill="#40916C" />
          <rect x="350" y="140" width="8" height="80" fill="#1B4332" />
          <ellipse cx="354" cy="140" rx="36" ry="28" fill="#40916C" />
          <rect x="900" y="120" width="7" height="70" fill="#1B4332" />
          <ellipse cx="904" cy="120" rx="30" ry="24" fill="#2D6A4F" />
          <rect x="1200" y="150" width="6" height="60" fill="#1B4332" />
          <ellipse cx="1203" cy="150" rx="26" ry="20" fill="#40916C" />
          {/* Sun */}
          <circle cx="1100" cy="80" r="45" fill="#D4A017" opacity="0.35" />
          <circle cx="1100" cy="80" r="30" fill="#F4C842" opacity="0.25" />
          {/* Animals silhouettes */}
          <ellipse cx="600" cy="215" rx="20" ry="10" fill="#0d2b1e" />
          <circle cx="600" cy="207" r="8" fill="#0d2b1e" />
          <rect x="618" y="210" width="3" height="12" fill="#0d2b1e" />
          <rect x="612" y="210" width="3" height="12" fill="#0d2b1e" />
          <rect x="594" y="210" width="3" height="12" fill="#0d2b1e" />
          <rect x="588" y="210" width="3" height="12" fill="#0d2b1e" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight text-center text-white mb-4">
            <span className="block">Discover. <span className="text-golden-400 text-[0.95em]">Book.</span></span>
            <span className="block">Explore Africa.</span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Book safaris, stays, local guides, and unforgettable experiences across Kenya and Tanzania — all in one place.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="search-card rounded-2xl p-1.5 shadow-2xl max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Destination */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-text">
                <MapPin className="w-5 h-5 text-safari-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="text-xs text-gray-400 font-medium">Where to?</div>
                  <input
                    type="text"
                    placeholder="Destinations, tours, stays..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full text-sm font-medium bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
              {/* Autocomplete */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  {suggestions.slice(0, 5).map((s) => (
                    <button key={s} onMouseDown={() => { setQuery(s); setShowSuggestions(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">
                      <MapPin className="w-4 h-4 text-safari-600" /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 my-2" />

            {/* Category */}
            <div className="relative md:w-44">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 font-medium">Category</div>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent outline-none text-gray-900 dark:text-white cursor-pointer">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 my-2" />

            {/* Guests */}
            <div className="md:w-32">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Users className="w-5 h-5 text-safari-600 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-medium">Guests</div>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                    className="text-sm font-medium bg-transparent outline-none text-gray-900 dark:text-white cursor-pointer">
                    {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSearch}
              className="flex items-center gap-2 bg-safari-700 hover:bg-safari-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </motion.div>
        {/* Pills */}
        <div className="pill-list">
          {['Maasai Mara Safari','Diani Beach','Kilimanjaro','Zanzibar','Amboseli','Watamu'].map(p => (
            <button key={p} className="pill" onClick={() => { setQuery(p); handleSearch() }}>{p}</button>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="hero-stats mt-10">
          {[
            { num: '2,400+', label: 'DESTINATIONS' },
            { num: '18,000+', label: 'LISTINGS' },
            { num: '340+', label: 'LOCAL GUIDES' },
            { num: '4.9★', label: 'AVERAGE RATING' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="num font-bold text-golden-400">{stat.num}</div>
              <div className="label text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
