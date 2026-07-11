import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Safety',
  description: 'Learn about the safety standards and support measures Tembea Africa provides for travellers.',
}

export default function SafetyPage() {
  return (
    <StaticPage
      title="Safety"
      description="Your safety and comfort matter from the moment you start planning until you return home."
      bullets={[
        'Verified guides and operators with local expertise',
        'Support for itinerary changes and emergency assistance',
        'Flexible booking options and secure payment processing',
      ]}
      ctaLabel="Explore stays"
      ctaHref="/stays"
    />
  )
}
