'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Lock } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-safari-gradient rounded-[2rem] p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="text-6xl mb-6">🌍</div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Tembea Africa</h1>
            <p className="text-white/80 leading-relaxed mb-8">One account for all your travel planning — bookings, guides, accommodations and personalized itineraries across Africa.</p>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-white/80">Secure checkout</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-white/80">Fast Google sign-in</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-white/80">Access your cart anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 rounded-3xl bg-safari-700 text-white grid place-items-center shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue with</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign in or create an account in one place.</p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/login" className="flex items-center justify-between gap-3 rounded-3xl border border-gray-200 dark:border-gray-700 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Email login</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use your existing account</p>
              </div>
              <Lock className="w-5 h-5 text-safari-600" />
            </Link>

            <Link href="/auth/register" className="flex items-center justify-between gap-3 rounded-3xl border border-gray-200 dark:border-gray-700 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Create account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sign up in under a minute</p>
              </div>
              <User className="w-5 h-5 text-safari-600" />
            </Link>

            <div className="mt-6">
              <Link href="/auth/login" className="block w-full rounded-3xl bg-safari-700 text-white py-3 text-center font-semibold hover:bg-safari-800 transition-colors">Continue with Google</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
