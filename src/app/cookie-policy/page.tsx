import { StaticPage } from '@/components/layout/StaticPage'

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Tembea Africa uses cookies and similar technologies on the website.',
}

export default function CookiePolicyPage() {
  return (
    <StaticPage
      title='Cookie Policy'
      description='Cookies help us improve the website experience, remember your preferences, and support booking functionality.'
      bullets={[
        'Essential cookies keep the site secure and functional.',
        'Analytics cookies help us understand how visitors use the site.',
        'You can manage cookie settings in your browser at any time.',
      ]}
      ctaLabel='Back home'
      ctaHref='/'
    />
  )
}
