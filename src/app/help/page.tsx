import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Help Center',
  description: 'Find answers about bookings, payments, travel planning, and account support.',
}

export default function HelpPage() {
  return (
    <StaticPage
      title="Help Center"
      description="Get support for bookings, itinerary planning, cancellations, and general questions about the platform."
      bullets={[
        'How to book a safari or stay',
        'Managing your itinerary and payments',
        'Support for refunds, changes, and travel planning',
      ]}
      ctaLabel="Browse destinations"
      ctaHref="/destinations"
    />
  )
}
