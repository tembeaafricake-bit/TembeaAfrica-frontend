'use client'
import Link from 'next/link'
import { useState } from 'react'

const CATEGORIES = [
  { label: 'All', href: '/search' },
  { label: 'Safaris', href: '/tours?category=safari' },
  { label: 'Hotels & Lodges', href: '/stays?type=hotel' },
  { label: 'BnBs & Villas', href: '/stays?type=bnb' },
  { label: 'Adventures', href: '/tours?category=adventure' },
  { label: 'Beach Escapes', href: '/tours?category=beach' },
  { label: 'Local Guides', href: '/guides' },
  { label: 'Transport', href: '/transport' },
  { label: 'Attraction Tickets', href: '/tickets' },
]

export function CategoryStrip() {
  const [active, setActive] = useState('All')
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 py-3">
          {CATEGORIES.map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setActive(label)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                active === label
                  ? 'bg-safari-700 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
