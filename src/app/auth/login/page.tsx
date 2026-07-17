'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader, Mail, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const nextQuery = searchParams.get('next') || '/dashboard'
  const [showPass, setShowPass] = useState(false)
  const [nextPath, setNextPath] = useState(nextQuery)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const googleLoginSuccess = searchParams.get('googleLoginSuccess')
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Google sign-in failed. Please try again.')
      return
    }

    setNextPath(nextQuery)

    if (!googleLoginSuccess && !accessToken && !refreshToken) return

    const processGoogleLogin = async () => {
      setLoading(true)
      try {
        if (accessToken && refreshToken) {
          Cookies.set('access_token', accessToken, { expires: 1, secure: true, sameSite: 'strict' })
          Cookies.set('refresh_token', refreshToken, { expires: 30, secure: true, sameSite: 'strict' })
        }

        const { data: user } = await authApi.me()
        setUser(user)
        router.replace(nextQuery)
      } catch (err) {
        if (accessToken && refreshToken) {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
        }
        toast.error('Google sign-in failed. Please log in manually.')
      } finally {
        setLoading(false)
      }
    }

    processGoogleLogin()
  }, [router, setUser, nextQuery])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      const { user } = res.data
      setUser(user)
      toast.success(`Welcome back, ${user.firstName}! 🦁`)

      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push(nextPath)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-safari-700 rounded-xl flex items-center justify-center text-xl">🐾</div>
              <span className="font-display font-bold text-lg">Tembea <span className="text-safari-600">Africa</span></span>
            </div>

            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h2>
            <p className="text-gray-500 text-sm mb-6">Welcome back — your Africa awaits</p>

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

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-safari-500 transition-colors" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-safari-600" />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-safari-600 hover:underline font-medium">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-safari-700 hover:bg-safari-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors mt-2">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign in →'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <a href={authApi.googleAuth(nextQuery)}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </a>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth" className="text-safari-600 font-semibold hover:underline">Create one free →</Link>
            </p>
          </div>
        </motion.div>
    </div>
  )
}
