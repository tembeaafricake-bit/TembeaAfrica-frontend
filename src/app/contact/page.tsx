import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Contact Tembea Africa',
  description: 'Get in touch with Tembea Africa about bookings, partnerships, or travel planning support.',
}

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Tembea Africa"
      description="Whether you are planning a safari, booking a stay, or exploring partnership opportunities, our team is here to help."
      bullets={[
        'Email: hello@tembeaafrica.com',
        'Phone: +254 700 000 000',
        'Nairobi, Kenya',
      ]}
      ctaLabel="View tours"
      ctaHref="/tours"
    />
  )
}
