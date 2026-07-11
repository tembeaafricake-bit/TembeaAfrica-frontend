import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Cancellations',
  description: 'Review Tembea Africa’s cancellation and change policy for bookings and travel plans.',
}

export default function CancellationsPage() {
  return (
    <StaticPage
      title="Cancellations"
      description="We aim to be flexible while keeping your booking experience simple and transparent."
      bullets={[
        'Cancellation terms vary by provider, tour, and accommodation.',
        'Most bookings can be adjusted before the departure date.',
        'Contact support for the latest terms on your reservation.',
      ]}
      ctaLabel="Contact support"
      ctaHref="/contact"
    />
  )
}
