import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Tembea Africa handles your personal information and account data.',
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title='Privacy Policy'
      description='We respect your privacy and use your information to improve the travel experience and support your bookings.'
      bullets={[
        'We collect account, booking, and communication details to provide our services.',
        'Your data is used to manage reservations, support requests, and product improvements.',
        'You can contact us if you need to update or review your personal information.',
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
