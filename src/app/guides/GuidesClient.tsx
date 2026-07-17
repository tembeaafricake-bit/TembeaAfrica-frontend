'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Award, Languages, DollarSign, Search, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { guidesApi } from '@/lib/api'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const FALLBACK_GUIDES = [
  { _id: 'g1', name: 'Joseph Kamau', category: 'safari', languages: ['English', 'Swahili', 'French'], rating: 5.0, reviewCount: 128, dailyRate: 80, experience: 12, verified: true, color: '#1B4332', initials: 'JK', specializations: ['Big Five tracking', 'Bird watching', 'Photography'], bio: 'KWS-certified guide with 12 years in Maasai Mara. Specialist in big cat behaviour.' },
  { _id: 'g2', name: 'Amina Mohamed', category: 'cultural', languages: ['English', 'Swahili', 'Arabic'], rating: 4.9, reviewCount: 95, dailyRate: 60, experience: 8, verified: true, color: '#185FA5', initials: 'AM', specializations: ['Stone Town', 'Spice tours', 'Coastal cuisine'], bio: 'Cultural guide with 8 years exploring Zanzibar\'s history and Swahili heritage.' },
  { _id: 'g3', name: 'Charles Mwangi', category: 'mountain', languages: ['English', 'Swahili'], rating: 4.9, reviewCount: 72, dailyRate: 120, experience: 15, verified: true, color: '#7B341E', initials: 'CM', specializations: ['Kilimanjaro', 'Mount Kenya', 'Wilderness first aid'], bio: 'KPAP-certified mountain guide. 15 years summiting Kilimanjaro and Mount Kenya.' },
  { _id: 'g4', name: 'Fatuma Ngugi', category: 'photography', languages: ['English', 'Swahili', 'German'], rating: 4.8, reviewCount: 54, dailyRate: 95, experience: 6, verified: false, color: '#5C2D91', initials: 'FN', specializations: ['Wildlife photography', 'Sunrise shoots', 'Portrait sessions'], bio: 'Photography guide specialising in golden hour wildlife shoots across the Mara.' },
  { _id: 'g5', name: 'Daniel Oloo', category: 'city', languages: ['English', 'Swahili', 'Luo'], rating: 4.7, reviewCount: 88, dailyRate: 45, experience: 5, verified: true, color: '#0B5394', initials: 'DO', specializations: ['Nairobi food tours', 'Street art', 'Nightlife'], bio: 'Nairobi city guide with intimate knowledge of hidden gems and local culture.' },
  { _id: 'g6', name: 'Grace Mutua', category: 'safari', languages: ['English', 'Swahili', 'Kikuyu'], rating: 4.8, reviewCount: 63, dailyRate: 75, experience: 9, verified: true, color: '#2D6A4F', initials: 'GM', specializations: ['Amboseli elephants', 'Night drives', 'Bush walks'], bio: 'Passionate about Amboseli\'s elephant families and Kilimanjaro views.' },
]

const CATEGORIES = ['All', 'safari', 'cultural', 'mountain', 'photography', 'city']
const CAT_LABELS: Record<string, string> = { safari: 'Safari Guide', cultural: 'Cultural Guide', mountain: 'Mountain Guide', photography: 'Photography Guide', city: 'City Guide' }
const GUIDE_CATEGORY_COLORS: Record<string, string> = {
  safari: '#1B4332',
  cultural: '#185FA5',
  mountain: '#7B341E',
  photography: '#5C2D91',
  city: '#0B5394',
}

const normalizeGuide = (guide: any) => {
  const firstName = guide.firstName || guide.user?.firstName || ''
  const lastName = guide.lastName || guide.user?.lastName || ''
  const name = guide.name || `${firstName} ${lastName}`.trim() || 'Guide'
  const initials = guide.initials || `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase().slice(0, 2)
  const color = guide.color || GUIDE_CATEGORY_COLORS[guide.category] || '#1B4332'
  const avatar = guide.avatar || guide.user?.avatar || null

  return {
    ...guide,
    name,
    initials,
    color,
    avatar,
    verified: guide.verified ?? !!guide.verified,
  }
}

export default function GuidesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [maxRate, setMaxRate] = useState(Number(searchParams.get('maxRate')) || 200)
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true')
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating')
  const currentListUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'All') params.set('category', category)
    if (maxRate !== 200) params.set('maxRate', String(maxRate))
    if (verifiedOnly) params.set('verified', 'true')
    if (sort && sort !== 'rating') params.set('sort', sort)
    return params.toString() ? `/guides?${params.toString()}` : '/guides'
  }, [search, category, maxRate, verifiedOnly, sort])
  const { addItem } = useCartStore()

  const handleBookGuide = (guide: any) => {
    addItem({
      id: guide._id,
      type: 'guide',
      name: `${guide.name} — Guide`,
      image: '',
      price: guide.dailyRate,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 1,
      details: {
        category: guide.category,
        specializations: guide.specializations,
        languages: guide.languages,
      },
    })
    toast.success('Guide added to cart!')
  }

  const { data, isError, error } = useQuery({
    queryKey: ['all-guides'],
    queryFn: () => guidesApi.getAll({ limit: 100 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  if (isError) {
    console.error('Guides query error:', error)
  }

  const guides = useMemo(() => {
    const rawGuides = data?.data?.length ? data.data : FALLBACK_GUIDES
    return rawGuides.map(normalizeGuide)
  }, [data])

  const filtered = useMemo(() => {
    let list = [...guides]
    if (search) list = list.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.specializations.some((s: string) => s.toLowerCase().includes(search.toLowerCase())))
    if (category !== 'All') list = list.filter(g => g.category === category)
    list = list.filter(g => g.dailyRate <= maxRate)
    if (verifiedOnly) list = list.filter(g => g.verified)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'rate-asc') list.sort((a, b) => a.dailyRate - b.dailyRate)
    else if (sort === 'experience') list.sort((a, b) => b.experience - a.experience)
    return list
  }, [guides, search, category, maxRate, verifiedOnly, sort])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <p className="text-golden-400 text-sm uppercase tracking-widest mb-3">Local expertise</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Expert Local Guides</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Connect with certified, experienced guides who know Africa's wild places better than anyone.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-200">Failed to load guides. Showing available guides.</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search guides or specializations..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer text-gray-700 dark:text-gray-200 border-0">
              <option value="rating">Top rated</option>
              <option value="rate-asc">Lowest rate</option>
              <option value="experience">Most experienced</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded text-safari-600" />
              Verified only
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all capitalize ${category === cat ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {cat === 'All' ? 'All guides' : (CAT_LABELS[cat] || cat)}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-5">{filtered.length} guide{filtered.length !== 1 ? 's' : ''} available</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((guide, i) => (
              <motion.div key={guide._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  {guide.avatar ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <img src={guide.avatar} alt={guide.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: guide.color }}>
                      {guide.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{guide.name}</h3>
                      {guide.verified && <div title="Verified guide"><Award className="w-4 h-4 text-safari-600 flex-shrink-0" /></div>}
                    </div>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{CAT_LABELS[guide.category] || guide.category} · {guide.experience}yr exp</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{guide.rating}</span>
                      <span className="text-xs text-gray-400">({guide.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{guide.bio}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.languages.map((l: string) => (
                    <span key={l} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.specializations.slice(0, 2).map((s: string) => (
                    <span key={s} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 dark:text-safari-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mb-3">
                  <div>
                    <span className="text-xl font-bold text-safari-700">${guide.dailyRate}</span>
                    <span className="text-xs text-gray-400">/day</span>
                  </div>
                  <Link href={`/guides/${guide._id}?from=${encodeURIComponent(currentListUrl)}`}
                    className="px-3 py-1.5 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-xs font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">
                    Profile
                  </Link>
                </div>
                <button onClick={() => handleBookGuide(guide)} className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium bg-safari-700 text-white rounded-xl hover:bg-safari-800 transition-colors">
                  <ShoppingCart className="w-3.5 h-3.5" /> Book Guide
                </button>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🦉</p>
              <p className="text-gray-500">No guides match your search. Try adjusting filters.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
