'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Camera, Building, Home, Mountain, Waves, User, Car, Ticket, Compass } from 'lucide-react'

const CATEGORIES = [
  { label: 'All', icon: Compass, href: '/search' },
  { label: 'Safaris', icon: Camera, href: '/tours?category=safari' },
  { label: 'Hotels & Lodges', icon: Building, href: '/stays?type=hotel' },
  { label: 'BnBs & Villas', icon: Home, href: '/stays?type=bnb' },
  { label: 'Adventures', icon: Mountain, href: '/tours?category=adventure' },
  { label: 'Beach Escapes', icon: Waves, href: '/tours?category=beach' },
  { label: 'Local Guides', icon: User, href: '/guides' },
  { label: 'Transport', icon: Car, href: '/transport' },
  { label: 'Attraction Tickets', icon: Ticket, href: '/tickets' },
]

export function CategoryStrip() {
  const [active, setActive] = useState('All')
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 py-3">
          {CATEGORIES.map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href} onClick={() => setActive(label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                active === label
                  ? 'bg-safari-700 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
