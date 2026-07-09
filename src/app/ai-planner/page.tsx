'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, Clock, DollarSign, ChevronDown, ChevronUp, Download, Share2, ShoppingCart, Loader } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { aiPlannerApi } from '@/lib/api'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const INTERESTS = ['Wildlife & Safari', 'Beach & Ocean', 'Cultural Heritage', 'Mountain Trekking', 'Photography', 'Luxury', 'Budget Travel', 'Family', 'Adventure Sports', 'Food & Cuisine']

interface ItineraryDay {
  day: number
  title: string
  activities: { time: string; activity: string; location: string; cost: number; notes?: string }[]
  accommodation: string
  accommodationCost: number
  transport: string
  meals: string[]
  tips: string
}

interface GeneratedPlan {
  summary: string
  days: ItineraryDay[]
  totalCost: { accommodation: number; tours: number; transport: number; meals: number; total: number }
}

// Simulated AI response (replace with real API call in production)
function generateMockItinerary(params: { destination: string; duration: number; budget: string; interests: string[]; guests: number }): GeneratedPlan {
  const days: ItineraryDay[] = Array.from({ length: params.duration }, (_, i) => {
    const isFirst = i === 0
    const isLast = i === params.duration - 1
    const safariDays = ['Maasai Mara', 'Serengeti'].some(d => params.destination.includes(d))
    const beachDays = ['Zanzibar', 'Diani', 'Mombasa'].some(d => params.destination.includes(d))

    return {
      day: i + 1,
      title: isFirst ? `Arrival in ${params.destination} · Welcome dinner` : isLast ? `Final day · Farewell & departure` : safariDays ? `Full-day game drive — ${['Morning lion sighting', 'Cheetah chase', 'Elephant herds'][i % 3]}` : beachDays ? `${['Snorkeling & reef walk', 'Dhow cruise', 'Spice farm tour'][i % 3]}` : `Explore ${params.destination}`,
      activities: isFirst ? [
        { time: '14:00', activity: 'Airport pickup & hotel check-in', location: params.destination, cost: 40, notes: 'Private transfer included' },
        { time: '17:00', activity: 'Orientation walk and sundowners', location: `${params.destination} viewpoint`, cost: 15 },
        { time: '19:30', activity: 'Welcome dinner at local restaurant', location: 'City centre', cost: 35, notes: 'Traditional cuisine recommended' },
      ] : isLast ? [
        { time: '07:00', activity: 'Sunrise breakfast & final views', location: 'Hotel', cost: 0 },
        { time: '10:00', activity: 'Last-minute souvenir shopping', location: 'Local market', cost: 30 },
        { time: '14:00', activity: 'Airport transfer & departure', location: 'Airport', cost: 40 },
      ] : [
        { time: '06:30', activity: 'Early morning game drive', location: `${params.destination} reserve`, cost: 120, notes: 'Best time for predator sightings' },
        { time: '12:00', activity: 'Bush lunch with panoramic views', location: 'Picnic site', cost: 25 },
        { time: '15:00', activity: 'Afternoon wildlife viewing', location: 'River crossing point', cost: 0, notes: 'Included in day tour' },
        { time: '19:00', activity: 'Sundowner drinks & dinner', location: 'Camp/lodge', cost: 45 },
      ],
      accommodation: params.interests.includes('Luxury') ? `${params.destination} Luxury Safari Lodge` : `${params.destination} Eco Camp`,
      accommodationCost: params.interests.includes('Luxury') ? 320 : 85,
      transport: i === 0 ? 'Private airport transfer' : 'Safari vehicle (4WD Land Cruiser)',
      meals: ['Breakfast included', 'Lunch at bush picnic', 'Dinner at camp'],
      tips: ['Bring binoculars and a good camera', 'Wear neutral-coloured clothing', 'Apply sunscreen and insect repellent'][i % 3],
    }
  })

  const totalAccommodation = days.reduce((s, d) => s + d.accommodationCost, 0) * params.guests
  const totalActivities = days.reduce((s, d) => s + d.activities.reduce((a, act) => a + act.cost, 0), 0) * params.guests
  const totalMeals = params.duration * 40 * params.guests
  const totalTransport = params.duration * 30 * params.guests

  return {
    summary: `A ${params.duration}-day ${params.interests.join(', ')} adventure in ${params.destination} for ${params.guests} traveller${params.guests > 1 ? 's' : ''}. This itinerary balances wildlife experiences, cultural immersion, and relaxation, crafted to match your ${params.budget} budget.`,
    days,
    totalCost: {
      accommodation: totalAccommodation,
      tours: totalActivities,
      transport: totalTransport,
      meals: totalMeals,
      total: totalAccommodation + totalActivities + totalTransport + totalMeals,
    },
  }
}

export default function AIPlanner() {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [form, setForm] = useState({
    destination: 'Kenya — Maasai Mara',
    duration: 7,
    budget: '$1,000–$2,500',
    guests: 2,
    startDate: '',
    style: 'Balanced',
  })
  const [interests, setInterests] = useState<string[]>(['Wildlife & Safari'])
  const { addItem } = useCartStore()

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const handleGenerate = async () => {
    setStep('loading')
    await new Promise(r => setTimeout(r, 2200))
    const result = generateMockItinerary({ destination: form.destination.split('—')[1]?.trim() || form.destination, duration: form.duration, budget: form.budget, interests, guests: form.guests })
    setPlan(result)
    setStep('result')
  }

  const addAllToCart = () => {
    if (!plan) return
    addItem({ id: 'ai-plan-' + Date.now(), type: 'tour', name: `AI Itinerary — ${form.destination} (${form.duration} days)`, image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400', price: plan.totalCost.total / form.guests, quantity: form.guests, startDate: form.startDate || new Date().toISOString().split('T')[0], guests: form.guests, details: { plan } })
    toast.success('Full itinerary added to cart!')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-14 px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-400/20 border border-blue-300/30 text-blue-200 text-sm px-4 py-2 rounded-full mb-4">
            Powered by AI
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">AI Travel Planner</h1>
          <p className="text-white/70 max-w-xl mx-auto">Describe your dream African trip and get a fully personalised, bookable itinerary in seconds.</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Tell us about your trip</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {[
                    { label: 'Destination', key: 'destination', type: 'select', opts: ['Kenya — Maasai Mara', 'Kenya — Mombasa & Diani', 'Kenya — Full Kenya', 'Tanzania — Zanzibar', 'Tanzania — Serengeti', 'Tanzania — Kilimanjaro', 'Tanzania — Full Tanzania', 'Both Kenya & Tanzania'] },
                    { label: 'Duration (days)', key: 'duration', type: 'select', opts: [3, 5, 7, 10, 14] },
                    { label: 'Budget per person', key: 'budget', type: 'select', opts: ['Under $500', '$500–$1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000+'] },
                    { label: 'Number of guests', key: 'guests', type: 'select', opts: [1, 2, 3, 4, 5, 6, 8, 10] },
                    { label: 'Start date (optional)', key: 'startDate', type: 'date', opts: [] },
                    { label: 'Travel style', key: 'style', type: 'select', opts: ['Relaxed', 'Balanced', 'Active', 'Luxury', 'Budget', 'Family'] },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{field.label}</label>
                      {field.type === 'date' ? (
                        <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-safari-400 transition-colors" />
                      ) : (
                        <select value={(form as Record<string, unknown>)[field.key] as string} onChange={e => setForm(f => ({ ...f, [field.key]: field.key === 'duration' || field.key === 'guests' ? Number(e.target.value) : e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-safari-400 transition-colors cursor-pointer">
                          {field.opts.map(o => <option key={String(o)}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Interests <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(i => (
                      <button key={i} onClick={() => toggleInterest(i)}
                        className={`px-4 py-2 rounded-full text-sm transition-all border ${interests.includes(i) ? 'bg-safari-700 text-white border-safari-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-safari-400'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={interests.length === 0}
                  className="w-full flex items-center justify-center gap-3 bg-safari-700 hover:bg-safari-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-base transition-colors">
                  <Sparkles className="w-5 h-5" /> Generate my itinerary
                </button>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-24">
                <div className="w-20 h-20 bg-safari-100 dark:bg-safari-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader className="w-10 h-10 text-safari-600 animate-spin" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Building your itinerary…</h2>
                <p className="text-gray-500">Our AI is crafting the perfect African adventure for you.</p>
                <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-400">
                  {['Selecting the best destinations for your interests…', 'Matching top-rated guides and operators…', 'Optimising your budget allocation…', 'Finalising your day-by-day schedule…'].map((msg, i) => (
                    <motion.p key={msg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}>{msg}</motion.p>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'result' && plan && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 mb-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-golden-500" />
                        <span className="text-sm font-medium text-golden-600">AI-Generated Itinerary</span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{form.destination.split('—')[1]?.trim() || form.destination} — {form.duration} Days</h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{plan.summary}</p>
                  {/* Cost breakdown */}
                  <div className="bg-safari-50 dark:bg-safari-900/20 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-safari-600" /> Estimated cost breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                      {[
                        { label: 'Accommodation', val: plan.totalCost.accommodation },
                        { label: 'Tours & Activities', val: plan.totalCost.tours },
                        { label: 'Transport', val: plan.totalCost.transport },
                        { label: 'Meals', val: plan.totalCost.meals },
                        { label: 'Total', val: plan.totalCost.total, highlight: true },
                      ].map(item => (
                        <div key={item.label} className={`p-3 rounded-xl ${item.highlight ? 'bg-safari-700 text-white' : 'bg-white dark:bg-gray-800'}`}>
                          <div className={`text-lg font-bold ${item.highlight ? 'text-white' : 'text-safari-700'}`}>${item.val.toLocaleString()}</div>
                          <div className={`text-xs mt-0.5 ${item.highlight ? 'text-white/70' : 'text-gray-500'}`}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Estimates for {form.guests} guest{form.guests > 1 ? 's' : ''}. Actual prices may vary.</p>
                  </div>
                </div>

                {/* Day-by-day */}
                <div className="space-y-3 mb-5">
                  {plan.days.map((day) => (
                    <div key={day.day} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-safari-700 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            D{day.day}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{day.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <MapPin className="w-3 h-3" />{day.accommodation}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-safari-600 bg-safari-50 dark:bg-safari-900/20 px-2 py-1 rounded-full">${day.activities.reduce((s, a) => s + a.cost, 0) + day.accommodationCost}/pp</span>
                          {expandedDay === day.day ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedDay === day.day && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                            <div className="px-5 pb-5">
                              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                                {day.activities.map((act, j) => (
                                  <div key={j} className="flex gap-3">
                                    <div className="text-xs text-gray-400 w-12 flex-shrink-0 pt-0.5">{act.time}</div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{act.activity}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {act.location}</div>
                                      {act.notes && <div className="text-xs text-safari-600 mt-0.5">💡 {act.notes}</div>}
                                    </div>
                                    <div className="text-xs font-medium text-safari-600 flex-shrink-0">{act.cost > 0 ? `$${act.cost}` : 'Free'}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                  <div className="text-gray-400 mb-1">Transport</div>
                                  <div className="text-gray-700 dark:text-gray-200">{day.transport}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                  <div className="text-gray-400 mb-1">Meals</div>
                                  <div className="text-gray-700 dark:text-gray-200">{day.meals[0]}</div>
                                </div>
                                <div className="bg-safari-50 dark:bg-safari-900/20 rounded-xl p-3">
                                  <div className="text-safari-500 mb-1">Tip</div>
                                  <div className="text-safari-700 dark:text-safari-400">{day.tips}</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={addAllToCart} className="flex-1 flex items-center justify-center gap-2 bg-safari-700 hover:bg-safari-800 text-white py-4 rounded-2xl font-semibold transition-colors">
                    <ShoppingCart className="w-5 h-5" /> Book this itinerary — ${plan.totalCost.total.toLocaleString()} total
                  </button>
                  <button onClick={() => setStep('form')} className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:border-safari-400 transition-colors">
                    Regenerate with changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
