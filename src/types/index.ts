export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: 'tourist' | 'guide' | 'operator' | 'admin'
  phone?: string
  nationality?: string
  createdAt: string
}

export interface Destination {
  _id: string
  name: string
  slug: string
  country: 'kenya' | 'tanzania'
  county?: string
  description: string
  heroImage: string
  images: string[]
  coordinates: { lat: number; lng: number }
  rating: number
  reviewCount: number
  tourCount: number
  hotelCount: number
  tags: string[]
  bestTimeToVisit: string
  featured: boolean
}

export interface Tour {
  _id: string
  title: string
  slug: string
  description: string
  destination: Destination
  category: 'safari' | 'beach' | 'adventure' | 'cultural' | 'mountain' | 'city' | 'daytrip' | 'multiday'
  images: string[]
  price: number
  currency: string
  duration: string
  groupSize: number
  minAge?: number
  rating: number
  reviewCount: number
  featured: boolean
  itinerary: ItineraryDay[]
  includes: string[]
  excludes: string[]
  operator: TourOperator
  availability: string[]
  instantBooking: boolean
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation?: string
}

export interface TourOperator {
  _id: string
  name: string
  logo?: string
  rating: number
  verified: boolean
}

export interface Accommodation {
  _id: string
  name: string
  slug: string
  type: 'hotel' | 'bnb' | 'guesthouse' | 'hostel' | 'lodge' | 'resort' | 'villa' | 'camping' | 'restaurant'
  destination: Destination
  description: string
  images: string[]
  pricePerNight: number
  currency: string
  rating: number
  reviewCount: number
  amenities: string[]
  rooms: Room[]
  coordinates: { lat: number; lng: number }
  featured: boolean
}

export interface Room {
  _id: string
  name: string
  description: string
  pricePerNight: number
  maxGuests: number
  images: string[]
  amenities: string[]
}

export interface Guide {
  _id: string
  user: User
  bio: string
  languages: string[]
  certifications: string[]
  specializations: string[]
  experience: number
  hourlyRate: number
  dailyRate: number
  rating: number
  reviewCount: number
  portfolio: string[]
  availability: string[]
  category: 'safari' | 'mountain' | 'cultural' | 'city' | 'photography'
  verified: boolean
}

export interface Booking {
  _id: string
  bookingNumber: string
  user: User
  items: BookingItem[]
  totalAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  paymentMethod?: string
  startDate: string
  endDate: string
  guests: number
  specialRequests?: string
  createdAt: string
}

export interface BookingItem {
  type: 'tour' | 'accommodation' | 'guide' | 'transport'
  itemId: string
  name: string
  quantity: number
  price: number
  startDate: string
  endDate?: string
}

export interface Review {
  _id: string
  user: User
  targetType: 'tour' | 'accommodation' | 'guide' | 'destination'
  targetId: string
  rating: number
  title: string
  body: string
  images?: string[]
  verified: boolean
  createdAt: string
}

export interface Message {
  _id: string
  conversationId: string
  sender: User
  content: string
  attachments?: string[]
  read: boolean
  createdAt: string
}

export interface Conversation {
  _id: string
  participants: User[]
  lastMessage?: Message
  topic: string
  relatedBooking?: string
  updatedAt: string
}

export interface AIItinerary {
  destination: string
  duration: number
  budget: number
  travelStyle: string
  days: AIDay[]
  estimatedCost: CostBreakdown
}

export interface AIDay {
  day: number
  title: string
  activities: AIActivity[]
  accommodation: string
  meals: string[]
  transport: string
  tips: string
}

export interface AIActivity {
  time: string
  activity: string
  location: string
  duration: string
  cost: number
  notes?: string
}

export interface CostBreakdown {
  accommodation: number
  tours: number
  transport: number
  meals: number
  activities: number
  total: number
}

export interface CartItem {
  id: string
  type: 'tour' | 'accommodation' | 'guide' | 'transport'
  name: string
  image: string
  price: number
  quantity: number
  startDate: string
  endDate?: string
  guests: number
  details: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
