import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE_URL = 'https://www.tembeaafrica.com'

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mainRoutes = [
    '',
    '/about',
    '/contact',
    '/destinations',
    '/tours',
    '/stays',
    '/transport',
    '/guides',
    '/blog',
    '/safety',
    '/help',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return Promise.resolve(mainRoutes)
}
