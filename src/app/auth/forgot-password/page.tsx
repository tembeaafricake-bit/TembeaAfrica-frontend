'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader, Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(data.email)
      toast.success(res.data?.message || 'Password reset email sent! Check your inbox.')
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/auth/login" className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 h-9 bg-safari-700 rounded-xl flex items-center justify-center text-xl">🐾</div>
            <span className="font-display font-bold text-lg">Tembea <span className="text-safari-600">Africa</span></span>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password</h2>
          <p className="text-gray-500 text-sm mb-6">No worries — we will send you instructions to reset it.</p>

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-safari-50 dark:bg-safari-950/20 text-safari-800 dark:text-safari-300 rounded-2xl text-sm leading-relaxed">
                If an account exists for that email address, you will receive an email shortly with link to reset your password.
              </div>
              <Link href="/auth/login" className="block w-full text-center bg-safari-700 hover:bg-safari-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('email')} type="email" placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-safari-700 hover:bg-safari-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors mt-2">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Sending link…</> : 'Send Reset Link →'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
