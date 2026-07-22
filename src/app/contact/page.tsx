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
        'Email: tembeaafricake@gmail.com',
        'Inquiries: tembeaafricake@gmail.com',
        'Phone: +254 700 000 000',
        'Physical office: 1st Floor, Runda Mall, Along Kiambu Road, Nairobi, Kenya',
      ]}
      sections={[
        {
          title: 'How we can help',
          content: [
            'For travel planning assistance, itinerary questions, itinerary changes, or booking support, send us an email and our team will get back to you as soon as possible.',
            'For partnerships, media requests, or business inquiries, please reach out to our team directly using the contact details above.',
          ],
        },
      ]}
      ctaLabel="View tours"
      ctaHref="/tours"
    />
  )
}
