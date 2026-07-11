import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for using Tembea Africa.',
}

export default function TermsPage() {
  return (
    <StaticPage
      title='Terms of Service'
      description='These terms govern access to Tembea Africa and the booking services made available through the platform, including your rights, responsibilities, and the limits of our liability.'
      sections={[
        {
          title: 'Booking responsibility',
          content: [
            'You agree to provide accurate booking details, comply with all applicable laws, and ensure that any traveller using our services is eligible to travel and has the necessary documents, permits, visas, and health requirements for the destination.',
            'All bookings are subject to availability, provider confirmation, and any separate terms imposed by hotels, transport operators, guides, or activity providers. Tembea Africa acts as an intermediary and is not responsible for the operational actions of third-party suppliers.',
          ],
        },
        {
          title: 'Payment, cancellation and disputes',
          content: [
            'Payments made through the platform are processed in accordance with the booking terms shown at checkout and any service-specific policies. You are responsible for reviewing those terms before confirming a reservation.',
            'Any disputes relating to cancellations, refunds, service quality, or provider conduct must be raised promptly and in good faith. Tembea Africa may assist in resolving such matters, but final remedies may depend on the applicable supplier terms and local law.',
          ],
        },
        {
          title: 'Limitation of liability',
          content: [
            'Tembea Africa shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profit, loss of data, travel interruption, or emotional distress arising from the use of the platform or any booking arranged through it.',
            'Our aggregate liability, if any, shall not exceed the amounts paid to us for the specific booking or service giving rise to the claim, except where such limitation is prohibited by law.',
          ],
        },
        {
          title: 'User conduct and indemnity',
          content: [
            'You agree not to misuse the platform, submit false information, impersonate another person, or interfere with the integrity of our systems, content, or communications.',
            'You indemnify Tembea Africa against any claims, losses, damages, or expenses arising from your misuse of the platform, your booking details, or any violation of these terms.',
          ],
        },
        {
          title: 'Intellectual property and governing law',
          content: [
            'All website content, branding, text, images, and materials remain the property of Tembea Africa or its licensors unless otherwise stated. You may not copy, reuse, or redistribute them without written permission.',
            'These terms are governed by the laws of the applicable jurisdiction, and any dispute shall be resolved through good-faith negotiation before formal legal action is pursued.',
          ],
        },
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
