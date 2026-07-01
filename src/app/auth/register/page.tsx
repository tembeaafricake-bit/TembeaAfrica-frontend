'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader, User, Mail, Lock, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      const res = await authApi.register(payload)
      const { user, accessToken, refreshToken } = res.data
      Cookies.set('access_token', accessToken, { expires: 1, secure: true, sameSite: 'strict' })
      Cookies.set('refresh_token', refreshToken, { expires: 30, secure: true, sameSite: 'strict' })
      setUser(user)
      toast.success(`Welcome to Tembea Africa, ${user.firstName}! 🌍`)
      router.push('/destinations')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-safari-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="font-display text-4xl font-bold text-white mb-4">Join <span className="text-golden-400">Tembea Africa</span></h1>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">Create your free account and unlock Africa's greatest travel experiences — safaris, beaches, mountains, and more.</p>
          <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
            {['Access 2,400+ verified listings', 'AI-powered itinerary planner', 'Book safaris, guides & hotels', 'Secure payments via Paystack', '24/7 travel support'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 bg-golden-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-golden-300 text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-safari-700 rounded-xl flex items-center justify-center text-xl">🐾</div>
              <span className="font-display font-bold text-lg">Tembea <span className="text-safari-600">Africa</span></span>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-6">Free forever — no credit card required</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['firstName', 'First name', User], ['lastName', 'Last name', User]].map(([key, label, Icon]) => {
                  const IconComponent = Icon as any
                  return (
                    <div key={key as string}>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label as string}</label>
                      <div className="relative">
                        <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input {...register(key as any)} placeholder={label as string}
                          className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                      </div>
                      {errors[key as keyof FormData] && <p className="text-red-500 text-xs mt-1">{errors[key as keyof FormData]?.message}</p>}
                    </div>
                  )
                })}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('email')} type="email" placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('phone')} type="tel" placeholder="+254 700 000 000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                </div>
              </div>

              {[['password', 'Password', 'Create a strong password'], ['confirmPassword', 'Confirm password', 'Repeat your password']].map(([key, label, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...register(key as any)} type={showPass ? 'text' : 'password'} placeholder={ph}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                    {key === 'password' && (
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {errors[key as keyof FormData] && <p className="text-red-500 text-xs mt-1">{errors[key as keyof FormData]?.message}</p>}
                </div>
              ))}

              <p className="text-xs text-gray-400">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-safari-600 hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-safari-600 hover:underline">Privacy Policy</Link>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-safari-700 hover:bg-safari-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create free account →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-safari-600 font-semibold hover:underline">Sign in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
