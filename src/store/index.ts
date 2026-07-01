import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, CartItem } from '@/types'
import Cookies from 'js-cookie'

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => localStorage) }
  )
)

// Cart Store
interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set({ items: get().items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return }
        set({ items: get().items.map((i) => i.id === id ? { ...i, quantity } : i) })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage', storage: createJSONStorage(() => localStorage) }
  )
)

// UI Store
interface UIState {
  searchQuery: string
  selectedDestination: string | null
  selectedDates: { checkIn: string; checkOut: string } | null
  selectedGuests: number
  mobileMenuOpen: boolean
  setSearchQuery: (q: string) => void
  setSelectedDestination: (d: string | null) => void
  setSelectedDates: (dates: { checkIn: string; checkOut: string } | null) => void
  setSelectedGuests: (n: number) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  searchQuery: '',
  selectedDestination: null,
  selectedDates: null,
  selectedGuests: 2,
  mobileMenuOpen: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDestination: (selectedDestination) => set({ selectedDestination }),
  setSelectedDates: (selectedDates) => set({ selectedDates }),
  setSelectedGuests: (selectedGuests) => set({ selectedGuests }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}))

// Wishlist Store
interface WishlistState {
  items: string[]
  addToWishlist: (id: string) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (id) => set({ items: [...get().items, id] }),
      removeFromWishlist: (id) => set({ items: get().items.filter((i) => i !== id) }),
      isInWishlist: (id) => get().items.includes(id),
    }),
    { name: 'wishlist-storage', storage: createJSONStorage(() => localStorage) }
  )
)
