import { MetadataRoute } from 'next'
import { BLOG_POSTS } from './blog/posts'

export const dynamic = 'force-static'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com'
const BASE_URL = 'https://www.tembeaafrica.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/destinations',
    '/destinations/maasai-mara',
    '/tours',
    '/tours/kenya-safari-packages',
    '/stays',
    '/stays/hotels-in-nairobi',
    '/transport',
    '/blog',
    '/guides',
    '/safety',
    '/help',
    '/terms',
    '/privacy',
    '/refunds',
    '/cancellations',
    '/cookie-policy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 2. Dynamic Destination Routes
  let destinationRoutes: any[] = []
  try {
    const response = await fetch(`${API_URL}/api/destinations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const data = Array.isArray(result?.data) ? result.data : []
    destinationRoutes = data.map((dest: any) => ({
      url: `${BASE_URL}/destinations/${dest.slug || dest._id}`,
      lastModified: new Date(dest.updatedAt || dest.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn('Failed to fetch destinations for sitemap:', error)
  }

  // 3. Dynamic Tour Routes
  let tourRoutes: any[] = []
  try {
    const response = await fetch(`${API_URL}/api/tours?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const data = Array.isArray(result?.data) ? result.data : []
    tourRoutes = data.map((tour: any) => ({
      url: `${BASE_URL}/tours/${tour.slug || tour._id}`,
      lastModified: new Date(tour.updatedAt || tour.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn('Failed to fetch tours for sitemap:', error)
  }

  // 4. Dynamic Stay Routes
  let stayRoutes: any[] = []
  try {
    const response = await fetch(`${API_URL}/api/accommodations?limit=1000`, { next: { revalidate: 3600 } })
    const result = await response.json()
    const data = Array.isArray(result?.data) ? result.data : []
    stayRoutes = data.map((stay: any) => ({
      url: `${BASE_URL}/stays/${stay.slug || stay._id}`,
      lastModified: new Date(stay.updatedAt || stay.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn('Failed to fetch accommodations for sitemap:', error)
  }

  // 5. Dynamic Blog Routes
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...destinationRoutes,
    ...tourRoutes,
    ...stayRoutes,
    ...blogRoutes,
  ]
}
