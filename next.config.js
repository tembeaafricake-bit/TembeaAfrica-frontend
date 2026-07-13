/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'cloudinary-images', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /_next\/(?:static|image)\//i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-resources', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /^https?:\/\/(?:localhost:3001|api\.tembeaafrica\.com)\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', networkTimeoutSeconds: 10, expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 } },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.tembeaafrica.com',
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.tembeaafrica.com',
  },
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  // Allow network dev host for HMR/font loading when previewing on LAN
  allowedDevOrigins: ['192.168.1.107'],
  turbopack: {},
}

module.exports = withPWA(nextConfig)
