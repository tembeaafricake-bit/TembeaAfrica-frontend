import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Tembea Africa handles your personal information and account data.',
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title='Privacy Policy'
      description='We respect your privacy and use your information to improve the travel experience and support your bookings in a lawful and transparent way.'
      sections={[
        {
          title: 'Information we collect',
          content: [
            'We collect personal information such as your name, contact details, travel preferences, booking history, and payment information when you create an account, make a reservation, contact support, or interact with our website.',
            'We may also collect technical information such as browser type, device details, IP address, and usage data to maintain security, improve site performance, and support service delivery.',
          ],
        },
        {
          title: 'How we use your data',
          content: [
            'Your information is used to process bookings, verify identities, communicate with you about your trip, provide customer support, prevent fraud, improve our services, and comply with applicable legal obligations.',
            'We may share limited information with trusted travel providers, payment processors, and service partners strictly for the purpose of fulfilling a booking or operating the platform.',
          ],
        },
        {
          title: 'Data retention and security',
          content: [
            'We retain personal data for as long as necessary to provide services, resolve disputes, comply with legal obligations, and enforce our agreements. When data is no longer required, we will delete or anonymise it where permitted.',
            'We implement reasonable administrative, technical, and organisational safeguards to protect personal information, but no system is completely secure. You use the platform at your own risk and should take appropriate steps to protect your own account credentials.',
          ],
        },
        {
          title: 'Your rights and limitations',
          content: [
            'Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your personal data. You can contact us to request details about the information we hold about you or to exercise those rights where applicable.',
            'This policy is intended to explain our practices clearly and does not guarantee that all data requests will be fulfilled in every circumstance, particularly where legal exemptions or operational constraints apply.',
          ],
        },
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
