'use client'

import { Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

const TICKETS = [
  { id: 'tk1', name: 'Maasai Mara National Reserve', location: 'Kenya', price: 80, type: 'Park entry' },
  { id: 'tk2', name: 'Serengeti National Park', location: 'Tanzania', price: 70, type: 'Park entry' },
  { id: 'tk3', name: 'Ngorongoro Crater', location: 'Tanzania', price: 60, type: 'Crater fee' },
  { id: 'tk4', name: 'Amboseli National Park', location: 'Kenya', price: 52, type: 'Park entry' },
  { id: 'tk5', name: 'Tsavo East National Park', location: 'Kenya', price: 52, type: 'Park entry' },
  { id: 'tk6', name: 'Lake Nakuru National Park', location: 'Kenya', price: 60, type: 'Park entry' },
]

export default function TicketsPage() {
  const router = useRouter()
  const { addItem } = useCartStore()

  const handleBook = (ticket: typeof TICKETS[0]) => {
    addItem({
      id: ticket.id,
      type: 'tour',
      name: `${ticket.name} — Ticket`,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      price: ticket.price,
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      guests: 1,
      details: {
        category: 'ticket',
        location: ticket.location,
        type: ticket.type,
      },
    })
    toast.success('Ticket added to cart!')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="bg-safari-gradient py-14 px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Attraction Tickets</h1>
          <p className="text-white/70 max-w-xl mx-auto">National park entries and attraction passes across Kenya and Tanzania.</p>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          {TICKETS.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-safari-100 dark:bg-safari-900/30 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-safari-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                  <p className="text-xs text-gray-500">{ticket.type} · {ticket.location}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                <p className="text-lg font-bold text-safari-700">${ticket.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleBook(ticket)} className="px-3 py-1.5 text-xs font-medium border border-safari-200 text-safari-700 rounded-xl hover:bg-safari-50 transition-colors">
                    Add to cart
                  </button>
                  <button onClick={() => { handleBook(ticket); router.push('/checkout') }} className="px-3 py-1.5 text-xs font-medium bg-safari-700 text-white rounded-xl hover:bg-safari-800 transition-colors">
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
