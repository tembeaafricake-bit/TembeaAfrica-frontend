import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'About Tembea Africa',
  description: 'Learn about Tembea Africa and how we help travellers discover meaningful experiences across East Africa.',
}

export default function AboutPage() {
  return (
    <StaticPage
      title="About Tembea Africa"
      description="Tembea Africa connects travellers with hand-picked safaris, stays, guides, and transport in Kenya and Tanzania."
      bullets={[
        'Curated travel experiences across safaris, beaches, treks, city breaks, and cultural adventures.',
        'Trusted local guides and operators with transparent pricing and instant booking support.',
        'A simple platform for planning, messaging, and managing bookings in one place.',
      ]}
      ctaLabel="Browse safaris"
      ctaHref="/tours"
    />
  )
}
