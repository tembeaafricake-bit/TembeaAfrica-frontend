'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Loader, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { paymentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref')

      try {
        if (reference) {
          // Paystack Flow
          const { data } = await paymentsApi.verifyPaystack(reference)
          if (data.success) {
            setSuccess(true)
            setBookingRef(data.booking?.bookingNumber || reference)
          } else {
            throw new Error(data.message || 'Paystack verification failed')
          }
        } else {
          // No parameters found, check if we arrived here by mistake
          throw new Error('No payment reference found. If you paid, please contact support.')
        }
      } catch (err: any) {
        console.error('Payment verification error:', err)
        setErrorMsg(err?.response?.data?.message || err?.message || 'Verification failed')
        setSuccess(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (verifying) {
    return (
      <div className="text-center py-20">
        <Loader className="w-12 h-12 text-safari-700 animate-spin mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying Payment...</h1>
        <p className="text-gray-500 text-sm">Please do not close this window or click back.</p>
      </div>
    )
  }

  if (!success) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full text-center border border-red-100 dark:border-red-950/30 shadow-lg mx-auto">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">{errorMsg || 'We were unable to verify your payment. Please try again or support.'}</p>
        
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/checkout')} className="w-full bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors">
            Return to Checkout
          </button>
          <Link href="/contact" className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block">
            Contact Support
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full text-center border border-gray-100 dark:border-gray-800 shadow-xl mx-auto">
      <div className="w-20 h-20 bg-safari-100 dark:bg-safari-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
        <Check className="w-10 h-10 text-safari-600" />
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
      <p className="text-gray-500 mb-6">Your African adventure is booked. We have sent a confirmation email to you.</p>
      
      <div className="bg-safari-50 dark:bg-safari-900/20 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-400 mb-1">Booking reference</p>
        <p className="font-mono text-xl font-bold text-safari-700">{bookingRef}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={() => router.push('/dashboard')} className="w-full bg-safari-700 text-white py-3 rounded-xl font-semibold hover:bg-safari-800 transition-colors">
          View My Bookings
        </button>
        <button onClick={() => router.push('/')} className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Back to Homepage
        </button>
      </div>
    </motion.div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
        <Suspense fallback={
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-safari-700 animate-spin mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading...</h1>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
