import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { BLOG_POSTS } from '../posts'

export function generateStaticParams() {
  return BLOG_POSTS.map(({ slug }) => ({ slug }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(item => item.slug === params.slug)

  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <BackButton fallback="/blog" label="Back to blog" className="text-white/90 hover:text-white mb-4" />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/80">{post.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">{post.title}</h1>
            <p className="text-white/70 mt-3">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            {post.content.map(paragraph => (
              <p key={paragraph} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p>
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
