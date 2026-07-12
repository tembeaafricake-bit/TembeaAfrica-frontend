import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: { default: 'Tembea Africa — Discover. Book. Explore Africa.', template: '%s | Tembea Africa' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  description: "Africa's leading travel marketplace. Book safaris, hotels, local guides, tours, and transport across Kenya and Tanzania.",
  keywords: ['Africa travel', 'Kenya safari', 'Tanzania tours', 'Maasai Mara', 'Zanzibar', 'Kilimanjaro', 'African tourism'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tembeaafrica.com',
    siteName: 'Tembea Africa',
    title: 'Tembea Africa — Discover. Book. Explore Africa.',
    description: "Africa's leading travel marketplace",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tembea Africa' }],
  },
  twitter: { card: 'summary_large_image', title: 'Tembea Africa', description: "Africa's leading travel marketplace" },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="shortcut icon" href="/favicon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png" />
        <meta name="theme-color" content="#1B4332" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-gray-950`}>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 1500, style: { borderRadius: '12px', background: '#1B4332', color: '#fff' } }} />
        </Providers>
      </body>
    </html>
  )
}
