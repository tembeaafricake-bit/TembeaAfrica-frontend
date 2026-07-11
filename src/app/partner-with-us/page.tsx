import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Partner With Us',
  description: 'Become a trusted operator, guide, or accommodation partner with Tembea Africa.',
}

export default function PartnerWithUsPage() {
  return (
    <StaticPage
      title='Partner With Us'
      description='We are growing our marketplace and welcome local guides, operators, and hospitality partners.'
      bullets={[
        'Join a growing travel marketplace focused on East Africa.',
        'Showcase your tours, stays, transport, and experiences to global travellers.',
        'Work with a platform built for direct bookings and local hospitality.',
      ]}
      ctaLabel='Contact us'
      ctaHref='/contact'
    />
  )
}
