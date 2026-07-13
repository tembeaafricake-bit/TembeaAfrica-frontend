'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Star, Award, ArrowLeft, Languages, ShoppingCart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { guidesApi } from '@/lib/api'
import { findGuideById } from '@/lib/fallback-data'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const CAT_LABELS: Record<string, string> = {
  safari: 'Safari Guide', cultural: 'Cultural Guide', mountain: 'Mountain Guide',
  photography: 'Photography Guide', city: 'City Guide',
}

export default function GuideDetailClient({ id }: { id: string }) {
  const { addItem } = useCartStore()

  const { data, isLoading } = useQuery({
    queryKey: ['guide', id],
    queryFn: () => guidesApi.getOne(id).then(r => r.data),
    retry: false,
  })

  const fallback = findGuideById(id)
  const apiGuide = data
  const guide = apiGuide ? {
    _id: apiGuide._id,
    name: apiGuide.user ? `${apiGuide.user.firstName} ${apiGuide.user.lastName}` : 'Guide',
    category: apiGuide.category,
    languages: apiGuide.languages || [],
    rating: apiGuide.rating,
    reviewCount: apiGuide.reviewCount,
    dailyRate: apiGuide.dailyRate,
    experience: apiGuide.experience,
    verified: apiGuide.verified,
    bio: apiGuide.bio,
    specializations: apiGuide.specializations || [],
    color: '#1B4332',
    initials: apiGuide.user ? `${apiGuide.user.firstName?.[0] || ''}${apiGuide.user.lastName?.[0] || ''}` : 'G',
    avatar: apiGuide.avatar || apiGuide.user?.avatar || null,
  } : fallback ? { ...fallback, avatar: fallback.avatar ?? null } : null

  if (!isLoading && !guide) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 px-4 text-center">
          <p className="text-4xl mb-4">🦉</p>
          <h1 className="text-2xl font-bold mb-2">Guide not found</h1>
          <BackButton fallback="/guides" label="Back to guides" className="text-safari-600 font-medium" />
        </main>
        <Footer />
      </>
    )
  }

  if (!guide) return null

  const handleBook = () => {
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <BackButton fallback="/guides" label="All guides" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-safari-600 mb-6" />

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {guide.avatar ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-100">
                  <img src={guide.avatar} alt={guide.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ background: guide.color }}>
                  {guide.initials}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{guide.name}</h1>
                  {guide.verified && <Award className="w-5 h-5 text-safari-600" aria-label="Verified guide" />}
                </div>
                <p className="text-gray-500 capitalize mt-1">{CAT_LABELS[guide.category] || guide.category} · {guide.experience} years experience</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-golden-400 text-golden-400" />
                  <span className="font-semibold">{guide.rating}</span>
                  <span className="text-sm text-gray-400">({guide.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-safari-700">${guide.dailyRate}</p>
                <p className="text-sm text-gray-400">per day</p>
              </div>
            </div>

            <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">{guide.bio}</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> Languages</p>
                <div className="flex flex-wrap gap-1">
                  {guide.languages.map((l: string) => (
                    <span key={l} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {guide.specializations.map((s: string) => (
                    <span key={s} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleBook} className="mt-8 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-safari-700 text-white rounded-xl font-medium hover:bg-safari-800 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Book this guide
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
