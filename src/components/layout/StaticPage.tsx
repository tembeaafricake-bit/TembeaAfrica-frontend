import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface StaticPageProps {
  title: string
  description: string
  bullets?: string[]
  ctaLabel?: string
  ctaHref?: string
}

export function StaticPage({ title, description, bullets = [], ctaLabel = 'Explore trips', ctaHref = '/tours' }: StaticPageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{title}</h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">{description}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            {bullets.length > 0 && (
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                {bullets.map(item => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-safari-600" />{item}</li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ctaHref} className="rounded-2xl bg-safari-700 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-800 transition-colors">{ctaLabel}</Link>
              <Link href="/" className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Back home</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
