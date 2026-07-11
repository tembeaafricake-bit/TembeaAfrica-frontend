import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = Cookies.get('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
          Cookies.set('access_token', data.accessToken, { expires: 1, secure: true, sameSite: 'strict' })
          if (original.headers) original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  googleAuth: () => `${API_URL}/api/auth/google`,
}

// Destinations
export const destinationsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/destinations', { params }),
  getOne: (slug: string) => api.get(`/destinations/${slug}`),
  getFeatured: () => api.get('/destinations/featured'),
  getByCountry: (country: string) => api.get(`/destinations/country/${country}`),
}

// Tours
export const toursApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/tours', { params }),
  getOne: (slug: string) => api.get(`/tours/${slug}`),
  getFeatured: () => api.get('/tours/featured'),
  getByDestination: (destinationId: string) => api.get(`/tours/destination/${destinationId}`),
  checkAvailability: (tourId: string, date: string, guests: number) =>
    api.post(`/tours/${tourId}/check-availability`, { date, guests }),
}

// Accommodations
export const accommodationsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/accommodations', { params }),
  getOne: (slug: string) => api.get(`/accommodations/${slug}`),
  getFeatured: () => api.get('/accommodations/featured'),
  checkAvailability: (id: string, checkIn: string, checkOut: string, guests: number) =>
    api.post(`/accommodations/${id}/check-availability`, { checkIn, checkOut, guests }),
}

// Guides
export const guidesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/guides', { params }),
  getOne: (id: string) => api.get(`/guides/${id}`),
  getFeatured: () => api.get('/guides/featured'),
  checkAvailability: (guideId: string, date: string) => api.post(`/guides/${guideId}/check-availability`, { date }),
}

// Bookings
export const bookingsApi = {
  create: (data: Record<string, unknown>) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getOne: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
  initiatePayment: (bookingId: string, method: string) =>
    api.post(`/bookings/${bookingId}/pay`, { method }),
}

// Reviews
export const reviewsApi = {
  create: (data: Record<string, unknown>) => api.post('/reviews', data),
  getForTarget: (targetType: string, targetId: string) =>
    api.get(`/reviews/${targetType}/${targetId}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

// Messaging
export const messagingApi = {
  getConversations: () => api.get('/messaging/conversations'),
  getMessages: (conversationId: string) => api.get(`/messaging/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string, attachments?: string[]) =>
    api.post(`/messaging/conversations/${conversationId}/messages`, { content, attachments }),
  startConversation: (topic: string, relatedBooking?: string) =>
    api.post('/messaging/conversations', { topic, relatedBooking }),
}

// AI Planner
export const aiPlannerApi = {
  generate: (data: {
    destination: string; duration: number; budget: number
    interests: string[]; travelStyle: string; guests: number; startDate: string
  }) => api.post('/ai-planner/generate', data),
  getSavedPlans: () => api.get('/ai-planner/saved'),
  savePlan: (plan: Record<string, unknown>) => api.post('/ai-planner/save', plan),
}

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getBookings: (params?: Record<string, unknown>) => api.get('/admin/bookings', { params }),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getListings: (params?: Record<string, unknown>) => api.get('/admin/listings', { params }),
  createListing: (type: string, data: Record<string, unknown>) => api.post(`/admin/listings?type=${type}`, data),
  banUser: (id: string, banned: boolean) => api.patch(`/admin/users/${id}/ban`, { banned }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getReviews: (params?: Record<string, unknown>) => api.get('/admin/reviews', { params }),
  updateBookingStatus: (id: string, status: string) => api.patch(`/admin/bookings/${id}/status`, { status }),
  updateListingStatus: (type: string, id: string, status: string) =>
    api.patch(`/admin/${type}/${id}/status`, { status }),
  approveReview: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
  deleteListing: (type: string, id: string) => api.delete(`/admin/${type}/${id}`),
}
