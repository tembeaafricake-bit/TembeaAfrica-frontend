'use client'
import { useState } from 'react'
import { Facebook, Instagram, Linkedin, Mail, Twitter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Sparkles, Star, Shield, RefreshCw, Clock, DollarSign, Award, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

// ─── AI Banner ──────────────────────────────────────────────────────────────
export function AIBanner() {
  const router = useRouter()
  const [form, setForm] = useState({ destination: 'Kenya', duration: '7', budget: '$1,000–$2,500', style: 'Adventure' })
  const interests = ['Wildlife', 'Beach', 'Cultural', 'Safari', 'Adventure', 'Photography', 'Luxury']
  const [selected, setSelected] = useState(['Safari', 'Wildlife'])

  const toggle = (i: string) => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])

  const handleGenerate = () => {
    const params = new URLSearchParams({ ...form, interests: selected.join(',') })
    router.push(`/ai-planner?${params}`)
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative bg-safari-gradient rounded-3xl overflow-hidden p-8 md:p-12">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-golden-300 text-sm uppercase tracking-wide font-medium">AI Travel Planner</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Let AI plan your perfect Africa trip
              </h2>
              <p className="text-white/70 text-base leading-relaxed mb-6">
                Tell us your dream trip — budget, dates, interests — and our AI generates a full personalised itinerary in seconds. Hotels, safaris, guides, and transport all included.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[['Destination', ['Kenya', 'Tanzania', 'Both']], ['Duration', ['3 days', '5 days', '7 days', '10 days', '14 days']], ['Budget', ['$500–$1K', '$1K–$2.5K', '$2.5K–$5K', '$5K+']]].map(([label, opts]) => (
                  <div key={label as string}>
                    <label className="text-white/50 text-xs uppercase tracking-wide block mb-1">{label as string}</label>
                    <select onChange={e => setForm(f => ({ ...f, [label as string === 'Destination' ? 'destination' : label as string === 'Duration' ? 'duration' : 'budget']: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                      {(opts as string[]).map(o => <option key={o} value={o} className="bg-safari-800">{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mb-6">
                <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <button key={i} onClick={() => toggle(i)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${selected.includes(i) ? 'bg-golden-500/30 border border-golden-400/50 text-golden-300' : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate}
                className="flex items-center gap-2 bg-golden-500 hover:bg-golden-400 text-safari-900 font-bold px-6 py-3 rounded-full transition-colors text-sm">
                Generate my itinerary →
              </button>
            </div>

            {/* Preview card */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-golden-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-golden-300" />
                  </div>
                  <span className="text-white font-medium text-sm">Sample AI Itinerary — Kenya 7 Days</span>
                </div>
                {[
                  { day: 'Day 1', title: 'Arrive Nairobi · Giraffe Centre', icon: '🦒' },
                  { day: 'Day 2–3', title: 'Fly to Maasai Mara · Game drives', icon: '🦁' },
                  { day: 'Day 4', title: 'Balloon safari at sunrise', icon: '🎈' },
                  { day: 'Day 5–6', title: 'Transfer to Diani Beach', icon: '🏖️' },
                  { day: 'Day 7', title: 'Snorkeling · Depart', icon: '🤿' },
                ].map(item => (
                  <div key={item.day} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-white/50 text-xs">{item.day}</div>
                      <div className="text-white text-sm font-medium">{item.title}</div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-golden-300 font-bold">$2,100</div><div className="text-white/50 text-xs">Est. total</div></div>
                  <div><div className="text-white font-bold">7</div><div className="text-white/50 text-xs">Days</div></div>
                  <div><div className="text-white font-bold">4.9★</div><div className="text-white/50 text-xs">Avg rating</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Featured Stays ──────────────────────────────────────────────────────────
const STAYS = [
  { _id: 's1', name: 'Mara Serena Safari Lodge', type: 'lodge', slug: 'mara-serena-safari-lodge', destination: 'Maasai Mara', pricePerNight: 320, currency: 'USD', rating: 4.9, reviewCount: 420, images: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600'], amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'] },
  { _id: 's2', name: 'Zanzibar Beach Resort', type: 'resort', slug: 'zanzibar-beach-resort', destination: 'Zanzibar', pricePerNight: 180, currency: 'USD', rating: 4.8, reviewCount: 310, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600'], amenities: ['Beachfront', 'Pool', 'Spa', 'Snorkeling'] },
  { _id: 's3', name: 'Nairobi City Boutique Hotel', type: 'hotel', slug: 'nairobi-city-boutique', destination: 'Nairobi', pricePerNight: 95, currency: 'USD', rating: 4.7, reviewCount: 280, images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600'], amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar'] },
]

export function FeaturedStays() {
  const { addItem } = useCartStore()

  const handleAddStayToCart = (stay: any, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    addItem({
      id: stay._id,
      type: 'accommodation',
      name: stay.name,
      image: stay.images[0],
      price: stay.pricePerNight,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 2,
      details: { type: stay.type, destination: stay.destination },
    })
    toast.success('Added to cart!')
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-safari-600 text-sm font-medium uppercase tracking-wide mb-2">Rest in style</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Top-rated stays</h2>
          </div>
          <Link href="/stays" className="text-safari-600 text-sm font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAYS.map((stay, i) => (
            <motion.div key={stay._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden card-hover">
              <Link href={`/stays/${stay.slug}`}>
                <div className="relative h-48">
                  <Image src={stay.images[0]} alt={stay.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 text-xs font-medium px-2 py-1 rounded-full capitalize text-gray-700 dark:text-gray-200">
                    {stay.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stay.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{stay.destination}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {stay.amenities.slice(0, 3).map(a => (
                      <span key={a} className="text-xs bg-safari-50 dark:bg-safari-900/20 text-safari-700 dark:text-safari-400 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div><span className="text-xl font-bold text-safari-700">${stay.pricePerNight}</span><span className="text-xs text-gray-400">/night</span></div>
                    <div className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 fill-golden-400 text-golden-400" /><span className="font-medium">{stay.rating}</span></div>
                  </div>
                </div>
              </Link>
              <div className="p-4 pt-0">
                <div className="mt-3 flex gap-2">
                  <Link href={`/stays/${stay.slug}`} className="flex-1 text-center py-2 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-sm font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">View stay</Link>
                  <button onClick={(e) => handleAddStayToCart(stay, e)} className="flex-1 py-2 bg-safari-700 text-white rounded-xl text-sm font-medium hover:bg-safari-800 transition-colors">Add to cart</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Featured Guides ─────────────────────────────────────────────────────────
const GUIDES = [
  { _id: 'g1', name: 'Joseph Kamau', category: 'safari', languages: ['EN', 'SW', 'FR'], rating: 5.0, reviewCount: 128, dailyRate: 80, experience: 12, avatar: null, initials: 'JK', color: '#1B4332', verified: true },
  { _id: 'g2', name: 'Amina Mohamed', category: 'cultural', languages: ['EN', 'SW', 'AR'], rating: 4.9, reviewCount: 95, dailyRate: 60, experience: 8, avatar: null, initials: 'AM', color: '#185FA5', verified: true },
  { _id: 'g3', name: 'Charles Mwangi', category: 'mountain', languages: ['EN', 'SW'], rating: 4.9, reviewCount: 72, dailyRate: 120, experience: 15, avatar: null, initials: 'CM', color: '#7B341E', verified: true },
  { _id: 'g4', name: 'Fatuma Ngugi', category: 'photography', languages: ['EN', 'SW', 'DE'], rating: 4.8, reviewCount: 54, dailyRate: 95, experience: 6, avatar: null, initials: 'FN', color: '#5C2D91', verified: false },
]

export function FeaturedGuides() {
  const { addItem } = useCartStore()

  const handleBookGuide = (guide: any, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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
        specializations: [],
        languages: guide.languages,
      },
    })
    toast.success('Guide added to cart!')
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-safari-600 text-sm font-medium uppercase tracking-wide mb-2">Local expertise</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Expert local guides</h2>
          </div>
          <Link href="/guides" className="text-safari-600 text-sm font-medium">Browse all guides →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GUIDES.map((guide, i) => (
            <motion.div key={guide._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 card-hover flex flex-col justify-between">
              <Link href={`/guides/${guide._id}`} className="block text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold" style={{ background: guide.color }}>
                  {guide.initials}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{guide.name}</h3>
                  {guide.verified && <Award className="w-4 h-4 text-safari-600" />}
                </div>
                <p className="text-xs text-gray-500 capitalize mb-2">{guide.category} guide · {guide.experience}yr exp</p>
                <div className="flex justify-center gap-1 mb-3">
                  {guide.languages.map(l => (
                    <span key={l} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < Math.floor(guide.rating) ? 'fill-golden-400 text-golden-400' : 'text-gray-200'}`} />)}
                </div>
                <p className="text-sm font-bold text-safari-700 mb-3">${guide.dailyRate}/day</p>
              </Link>
              <div className="mt-2 flex gap-2">
                <Link href={`/guides/${guide._id}`} className="flex-1 text-center py-2 border border-safari-200 dark:border-safari-700 text-safari-700 dark:text-safari-400 rounded-xl text-xs font-medium hover:bg-safari-50 dark:hover:bg-safari-900/20 transition-colors">Profile</Link>
                <button onClick={(e) => handleBookGuide(guide, e)} className="flex-1 py-2 bg-safari-700 text-white rounded-xl text-xs font-medium hover:bg-safari-800 transition-colors">Book</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trust Strip ─────────────────────────────────────────────────────────────
export function TrustStrip() {
  const items = [
    { icon: Shield, label: 'Verified listings', desc: 'Every listing manually reviewed' },
    { icon: Award, label: 'Secure payments', desc: 'Paystack protected' },
    { icon: Clock, label: '24/7 support', desc: 'Always here to help' },
    { icon: RefreshCw, label: 'Free cancellations', desc: 'On most bookings' },
    { icon: DollarSign, label: 'Best price guarantee', desc: 'Or we match it' },
  ]
  return (
    <div className="bg-safari-50 dark:bg-safari-900/20 border-y border-safari-100 dark:border-safari-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around flex-wrap gap-6">
          {items.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-safari-100 dark:bg-safari-800 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-safari-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah Williams', location: 'London, UK', tour: 'Maasai Mara Safari', rating: 5, text: 'Booking was seamless and our guide Joseph was phenomenal — spotted a leopard on the first morning. Tembea Africa made the whole trip effortless from start to finish. Already planning my return trip!', initials: 'SW', color: '#1B4332' },
  { name: 'Marco Pellegrini', location: 'Milan, Italy', tour: 'Zanzibar Beach Tour', rating: 5, text: 'The AI itinerary planner suggested a Zanzibar + Serengeti combo and it was the best decision of my life. Everything booked in one place, payment was smooth. The platform feels like a dream.', initials: 'MP', color: '#185FA5' },
  { name: 'Aisha Kimani', location: 'Nairobi, Kenya', tour: 'Kilimanjaro Trek', rating: 5, text: 'Summited Kilimanjaro with a certified guide booked through Tembea. The messaging feature made coordinating logistics completely stress-free. An absolutely world-class platform.', initials: 'AK', color: '#7B341E' },
  { name: 'Emma Schultz', location: 'Berlin, Germany', tour: 'Serengeti Migration', rating: 5, text: 'Witnessed the Great Migration and cried happy tears. The lodge, guide, and transport were all booked through one platform. Cannot recommend Tembea Africa enough. 10/10!', initials: 'ES', color: '#5C2D91' },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-safari-600 text-sm font-medium uppercase tracking-wide mb-2">Happy travellers</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">What our guests say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.location}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-golden-400 text-golden-400" />)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-3 text-xs text-safari-600 font-medium">{t.tour}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export function Footer() {
  const footerSections = [
    {
      title: 'Explore',
      links: [
        { label: 'Destinations', href: '/destinations' },
        { label: 'Tours & Safaris', href: '/tours' },
        { label: 'Hotels & Stays', href: '/stays' },
        { label: 'Local Guides', href: '/guides' },
        { label: 'Transport', href: '/transport' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'Careers', href: '/about' },
        { label: 'Press', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Safety', href: '/safety' },
        { label: 'Cancellations', href: '/cancellations' },
        { label: 'Refunds', href: '/refunds' },
        { label: 'Partner with us', href: '/partner-with-us' },
      ],
    },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ]

  return (
    <footer className="bg-safari-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-xl">🐾</div>
              <span className="font-display text-xl font-bold">Tembea <span className="text-golden-400">Africa</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Africa&apos;s leading travel marketplace. Discover, book, and explore Kenya and Tanzania with ease.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
              <Mail size={16} className="text-golden-400" />
              <a href="mailto:tembeaafricake@gmail.com" className="hover:text-white transition-colors">tembeaafricake@gmail.com</a>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Twitter', href: '#', icon: Twitter },
                { label: 'Instagram', href: '#', icon: Instagram },
                { label: 'Facebook', href: '#', icon: Facebook },
                { label: 'LinkedIn', href: '#', icon: Linkedin },
              ].map(social => {
                const Icon = social.icon
                return (
                  <a key={social.label} href={social.href} aria-label={social.label} className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>
          {footerSections.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}><a href={link.href} className="text-white/60 text-sm hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 Tembea Africa Ltd. All rights reserved. Nairobi, Kenya.</p>
          <div className="flex gap-6">
            {legalLinks.map(link => (
              <a key={link.label} href={link.href} className="text-white/40 text-xs hover:text-white/70 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
