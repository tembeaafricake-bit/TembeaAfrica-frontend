import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
import { BLOG_POSTS } from './posts'

export const metadata: Metadata = {
  title: 'Tembea Africa Travel Blog | Kenya & Tanzania Safari Tips',
  description: 'Read expert Kenya and Tanzania travel guides, safari advice, beach escape tips, and adventure planning from Tembea Africa.',
  keywords: ['Kenya travel blog', 'Tanzania travel tips', 'safari guide', 'Zanzibar travel', 'Kilimanjaro preparation'],
}

const POSTS = BLOG_POSTS

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Travel Blog</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Discover Kenya and Tanzania travel advice, safari planning tips, beach escapes, and insider destination guides designed to help you book a smarter, more memorable trip.
          </p>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          {POSTS.map(post => (
            <article key={post.slug} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
              <span className="text-xs font-medium text-safari-600 uppercase tracking-wide">{post.category}</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-2 mb-2">{post.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <Link href={`/blog/${post.slug}`} className="text-sm text-safari-600 font-medium hover:underline">Read more →</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
