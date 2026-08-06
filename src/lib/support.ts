import { api } from '@/lib/api'
import { io, Socket } from 'socket.io-client'

export const supportApi = {
  // Visitor operations
  initVisitor: async (data: {
    visitorId?: string
    ip?: string
    device?: string
    browser?: string
    country?: string
    referrer?: string
  }) => {
    const res = await api.post('/support/visitor', data)
    return res.data
  },

  updateVisitorProfile: async (visitorId: string, profile: { name?: string; email?: string; phone?: string; tripBuilder?: any }) => {
    const res = await api.patch('/support/visitor/profile', { visitorId, ...profile })
    return res.data
  },

  trackPage: async (visitorId: string, url: string, title: string) => {
    const res = await api.post('/support/visitor/track', { visitorId, url, title })
    return res.data
  },

  startConversation: async (visitorId: string, topic?: string) => {
    const res = await api.post('/support/conversation', { visitorId, topic })
    return res.data
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const res = await api.get(`/support/conversations/${conversationId}/messages`, { params: { page, limit } })
    return res.data
  },

  sendMessage: async (conversationId: string, data: { senderId: string; senderType: string; content: string; attachments?: string[] }) => {
    const res = await api.post(`/support/conversations/${conversationId}/messages`, data)
    return res.data
  },

  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/support/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  // Agent console operations
  getConversations: async (filters?: { status?: string; assignedAgent?: string; search?: string; tag?: string }) => {
    const res = await api.get('/support/conversations', { params: filters })
    return res.data
  },

  getConversation: async (id: string) => {
    const res = await api.get(`/support/conversations/${id}`)
    return res.data
  },

  assignConversation: async (id: string, agentId: string) => {
    const res = await api.patch(`/support/conversations/${id}/assign`, { agentId })
    return res.data
  },

  updateStatus: async (id: string, status: string, reason?: string) => {
    const res = await api.patch(`/support/conversations/${id}/status`, { status, reason })
    return res.data
  },

  addNote: async (conversationId: string, noteText: string) => {
    const res = await api.post(`/support/conversations/${conversationId}/notes`, { noteText })
    return res.data
  },

  addTag: async (conversationId: string, tagName: string) => {
    const res = await api.post(`/support/conversations/${conversationId}/tags`, { tagName })
    return res.data
  },

  removeTag: async (conversationId: string, tagId: string) => {
    const res = await api.delete(`/support/conversations/${conversationId}/tags/${tagId}`)
    return res.data
  },

  generateQuotation: async (id: string, details: any) => {
    const res = await api.post(`/support/conversations/${id}/quotation`, details)
    return res.data
  },

  convertQuoteToBooking: async (id: string, details: any) => {
    const res = await api.post(`/support/conversations/${id}/book-quote`, details)
    return res.data
  },

  getAgents: async () => {
    const res = await api.get('/support/agents')
    return res.data
  },

  updateAgentStatus: async (status: string) => {
    const res = await api.patch('/support/agent/status', { status })
    return res.data
  },

  getDepartments: async () => {
    const res = await api.get('/support/departments')
    return res.data
  },

  createDepartment: async (name: string, description?: string) => {
    const res = await api.post('/support/departments', { name, description })
    return res.data
  },

  exportChatUrl: (id: string) => {
    const baseURL = api.defaults.baseURL || 'https://api.tembeaafrica.com/api'
    return `${baseURL}/support/conversations/${id}/export`
  },
}

// Socket Connection Manager Hook
let supportSocket: Socket | null = null

export const connectSupportSocket = (userId: string): Socket => {
  if (supportSocket && supportSocket.connected) {
    return supportSocket
  }

  const baseURL = api.defaults.baseURL || 'https://api.tembeaafrica.com/api'
  // Point to Socket.IO namespace '/support'
  const socketHost = baseURL.replace('/api', '')

  supportSocket = io(`${socketHost}/support`, {
    auth: { userId },
    query: { userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  })

  supportSocket.on('connect', () => {
    console.log('[Support Socket] Connected successfully')
  })

  supportSocket.on('disconnect', (reason) => {
    console.log('[Support Socket] Disconnected:', reason)
  })

  supportSocket.on('connect_error', (err) => {
    console.error('[Support Socket] Connection error:', err)
  })

  return supportSocket
}

export const disconnectSupportSocket = () => {
  if (supportSocket) {
    supportSocket.disconnect()
    supportSocket = null
  }
}

export const getSupportSocket = (): Socket | null => {
  return supportSocket
}
