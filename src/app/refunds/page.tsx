import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Refunds',
  description: 'Understand the refund process for bookings made through Tembea Africa.',
}

export default function RefundsPage() {
  return (
    <StaticPage
      title='Refunds'
      description='Refunds depend on the provider and timing of your booking request.'
      bullets={[
        'Refund eligibility is reviewed case by case.',
        'Some tours and properties have non-refundable or partially refundable terms.',
        'Reach out to support for the fastest review of your request.',
      ]}
      ctaLabel='Contact support'
      ctaHref='/contact'
    />
  )
}
