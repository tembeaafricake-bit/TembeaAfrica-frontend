import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { BLOG_POSTS } from '../posts'

import { JsonLd } from '@/components/seo/JsonLd'

export function generateStaticParams() {
  return BLOG_POSTS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find(item => item.slug === slug)

  if (!post) {
    return {
      title: 'Blog Post',
      description: 'Read more about travel in Kenya and Tanzania.',
    }
  }

  return {
    title: `${post.title} | Tembea Africa`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = BLOG_POSTS.find(item => item.slug === slug)

  if (!post) notFound()

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: {
          '@type': 'Organization',
          name: 'Tembea Africa',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Tembea Africa',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.tembeaafrica.com/favicon-192.png',
          },
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.tembeaafrica.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://www.tembeaafrica.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://www.tembeaafrica.com/blog/${post.slug}`,
          },
        ],
      }} />
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <BackButton fallback="/blog" label="Back to blog" className="text-white/90 hover:text-white mb-4" />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/80">{post.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">{post.title}</h1>
            <p className="text-white/70 mt-3 max-w-2xl">{post.excerpt}</p>
            <p className="text-white/60 mt-2">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            {post.content.map((paragraph, index) => (
              <p key={`${post.slug}-${index}`} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p>
            ))}

            <div className="mt-8 rounded-2xl bg-safari-50 dark:bg-safari-900/20 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Highlights</h2>
              <ul className="space-y-2">
                {post.highlights.map(item => (
                  <li key={item} className="text-sm text-gray-600 dark:text-gray-300">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
