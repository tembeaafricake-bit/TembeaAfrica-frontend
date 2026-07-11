import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Tembea Africa uses cookies and similar technologies on the website.',
}

export default function CookiePolicyPage() {
  return (
    <StaticPage
      title='Cookie Policy'
      description='Cookies help us improve the website experience, remember your preferences, support booking functionality, and analyse how visitors use our services.'
      sections={[
        {
          title: 'What cookies do',
          content: [
            'Essential cookies are used to keep the site secure, maintain your session, remember your consent choices, and ensure core features such as login, checkout, and navigation function properly.',
            'Preference and analytics cookies help us remember your choices, understand traffic patterns, and improve product performance. These tools allow us to identify which pages are most useful and where users may encounter issues.',
          ],
        },
        {
          title: 'Your control',
          content: [
            'Most browsers allow you to accept, reject, or delete cookies. You may disable non-essential cookies through your browser settings or our cookie preferences, although doing so may affect certain website features and the quality of your experience.',
            'We do not use cookies to collect sensitive personal information beyond what is reasonably necessary for security, site functionality, and analytics. Any third-party cookies used by service providers are subject to their own privacy and data handling practices.',
          ],
        },
        {
          title: 'Limitation of reliance',
          content: [
            'While we use cookies and similar technologies to improve our services, we do not guarantee that all tracking technologies will be error-free, fully secure, or permanently available. You acknowledge that website functionality may vary depending on device settings, browser restrictions, or network conditions.',
            'By continuing to use our website, you consent to the use of cookies as described in this policy unless you disable them in your browser settings or through the available preferences controls.',
          ],
        },
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
