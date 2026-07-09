'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Lock } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
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
