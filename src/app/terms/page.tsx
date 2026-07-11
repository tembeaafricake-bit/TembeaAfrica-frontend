import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for using Tembea Africa.',
}

export default function TermsPage() {
  return (
    <StaticPage
      title='Terms of Service'
      description='These terms govern access to Tembea Africa and the booking services made available through the platform.'
      bullets={[
        'Use the platform responsibly and in line with local laws and travel regulations.',
        'Bookings are subject to provider availability and specific terms.',
        'Please contact support for questions about your reservation or account.',
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
