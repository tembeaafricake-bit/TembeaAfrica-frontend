'use client'
import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Destinations page error:', error)
  }, [error])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error.message || 'Failed to load destinations'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-safari-700 text-white rounded-xl font-medium hover:bg-safari-800 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
