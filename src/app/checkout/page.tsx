'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash2, ShoppingCart, CreditCard, Shield, ChevronRight, Loader, Check } from 'lucide-react'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useCartStore, useAuthStore } from '@/store'
import { authApi, bookingsApi, paymentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

type Step = 'cart' | 'details' | 'payment' | 'success'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
  const { isAuthenticated, user, setUser } = useAuthStore()
  const [step, setStep] = useState<Step>('cart')
  const [loading, setLoading] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [details, setDetails] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: '', nationality: '', specialRequests: '',
  })

  const subtotal = totalPrice()
  const serviceFee = Math.round(subtotal * 0.08)
  const total = subtotal + serviceFee

  useEffect(() => {
    const restoreSession = async () => {
      if (isAuthenticated) {
        setCheckingAuth(false)
        return
      }

      try {
        const { data: user } = await authApi.silentMe()
        setUser(user)
      } catch {
        // no valid session available
      } finally {
        setCheckingAuth(false)
      }
    }

    restoreSession()
  }, [isAuthenticated, setUser, authApi])

  const handlePayment = async () => {
    if (!isAuthenticated) { router.push('/auth/login?next=/checkout'); return }
    setLoading(true)
    try {
      const bookingData = {
        items: items.map(i => ({ type: i.type, itemId: i.id, name: i.name, quantity: i.quantity, price: i.price, startDate: i.startDate, endDate: i.endDate })),
        totalAmount: total, currency: 'USD', guests: items[0]?.guests || 2,
        guestDetails: details, paymentMethod: 'paystack',
        startDate: items[0]?.startDate, endDate: items[0]?.endDate,
      }
      const { data: booking } = await bookingsApi.create(bookingData)

      const { data: initData } = await paymentsApi.initializePaystack(booking._id)
      if (initData?.paymentUrl) {
        clearCart()
        window.location.href = initData.paymentUrl
        return
      }

      setBookingRef(booking.bookingNumber || 'TA-' + Math.random().toString(36).substring(2, 8).toUpperCase())
      clearCart()
      setStep('success')
    } catch (err: any) {
      console.error('Payment initiation error:', err)
      toast.error(err?.response?.data?.message || 'Booking or payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full text-center border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-safari-100 dark:bg-safari-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-safari-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500 mb-4">Your African adventure is booked. Check your email for full details.</p>
            <div className="bg-safari-50 dark:bg-safari-900/20 rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">Booking reference</p>
              <p className="font-mono text-xl font-bold text-safari-700">{bookingRef}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/dashboard')} className="w-full bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors">
                View my bookings
              </button>
              <button onClick={() => router.push('/')} className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Back to homepage
              </button>
            </div>
          </motion.div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            {(['cart', 'details', 'payment'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (i < ['cart', 'details', 'payment'].indexOf(step)) ? 'bg-safari-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`capitalize ${step === s ? 'text-safari-700 font-medium' : 'text-gray-400'}`}>{s}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Cart step */}
              {step === 'cart' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-safari-600" /> Your cart ({items.length} item{items.length !== 1 ? 's' : ''})
                  </h2>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-4xl mb-3">🛒</p>
                      <p className="text-gray-500">Your cart is empty</p>
                      <button onClick={() => router.push('/tours')} className="mt-4 text-safari-600 font-medium text-sm">Browse tours →</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.type} · {item.startDate}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700">−</button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
                              </div>
                              <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-safari-700">${(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">${item.price}/pp</p>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setStep('details')} disabled={items.length === 0}
                        className="w-full bg-safari-700 text-white py-3.5 rounded-xl font-semibold hover:bg-safari-800 transition-colors mt-4">
                        Continue to details →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Details step */}
              {step === 'details' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Guest details</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Email address'], ['phone', 'Phone number'], ['nationality', 'Nationality']].map(([key, label]) => (
                      <div key={key} className={key === 'email' ? 'col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                        <input type={key === 'email' ? 'email' : 'text'} value={(details as Record<string, string>)[key]}
                          onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-safari-400 transition-colors" />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Special requests (optional)</label>
                      <textarea value={details.specialRequests} onChange={e => setDetails(d => ({ ...d, specialRequests: e.target.value }))} rows={3}
                        placeholder="Dietary requirements, accessibility needs, celebrations..."
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-safari-400 transition-colors resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('cart')} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      ← Back
                    </button>
                    <button onClick={() => setStep('payment')} className="flex-1 bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors">
                      Continue to payment →
                    </button>
                  </div>
                </div>
              )}

              {/* Payment step */}
              {step === 'payment' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-safari-600" /> Payment method
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-safari-600 bg-safari-50 dark:bg-safari-900/20">
                      <span className="text-2xl">💳</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Paystack</div>
                        <div className="text-xs text-gray-500">Cards, mobile money, bank transfer</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <Shield className="w-4 h-4 text-safari-600 flex-shrink-0" />
                    <span>Your payment is secured with 256-bit SSL encryption. We never store your card details.</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('details')} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      ← Back
                    </button>
                    {checkingAuth ? (
                      <button disabled className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold transition-colors">
                        <Loader className="w-5 h-5 animate-spin" /> Checking login…
                      </button>
                    ) : !isAuthenticated ? (
                      <button onClick={() => router.push('/auth/login?next=/checkout')}
                        className="flex-1 bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors">
                        Sign in to pay
                      </button>
                    ) : (
                      <button onClick={handlePayment} disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors disabled:opacity-60">
                        {loading ? <><Loader className="w-5 h-5 animate-spin" /> Processing…</> : `Pay $${total.toLocaleString()} via Paystack`}
                      </button>
                    )}
                  </div>
                  {!isAuthenticated && !checkingAuth && (
                    <p className="mt-3 text-sm text-gray-500">You need to sign in before paying with Paystack.</p>
                  )}
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order summary</h3>
                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 line-clamp-1 flex-1 mr-2">{item.name}</span>
                      <span className="font-medium flex-shrink-0">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Service fee (8%)</span><span>${serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                    <span>Total</span><span className="text-safari-700">${total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <p>✅ Free cancellation on most items</p>
                  <p>✅ 24/7 customer support</p>
                  <p>✅ Secure payment gateway</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
