'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  UserPlus,
  Lock,
  CheckCircle,
  Archive,
  BookOpen,
  Filter,
  Download,
  Plus,
  Trash2,
  Send,
  Paperclip,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Users as UsersIcon,
  Check,
  ChevronRight,
  UserCheck,
  Tag,
  AlertCircle,
  Clock,
  Pin,
  X,
  MessageSquare,
  Shield,
  Smile,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supportApi, connectSupportSocket, getSupportSocket, disconnectSupportSocket } from '@/lib/support'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

interface Conversation {
  _id: string
  topic?: string
  status: 'pending' | 'open' | 'waiting' | 'closed' | 'quoted' | 'booked' | 'cancelled'
  tags: any[]
  assignedAgent?: { _id: string; firstName: string; lastName: string; avatar?: string }
  visitor: {
    _id: string
    name?: string
    email?: string
    phone?: string
    ip?: string
    device?: string
    browser?: string
    country?: string
    pagesVisited?: Array<{ url: string; title: string; visitedAt: string }>
    tripBuilder?: any
  }
  tripBuilder: any
  lastMessage?: any
  updatedAt: string
}

export default function SupportDashboard() {
  const { user: currentUser } = useAuthStore()

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activeConv, setActiveConv] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [agentStatus, setAgentStatus] = useState('online')

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignFilter, setAssignFilter] = useState<'all' | 'unassigned' | 'mine'>('all')

  // Chat inputs
  const [inputText, setInputText] = useState('')
  const [chatMode, setChatMode] = useState<'reply' | 'note'>('reply') // 'reply' = client visible, 'note' = internal private
  const [isVisitorTyping, setIsVisitorTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({})

  // Quote Builder Items
  const [quoteItems, setQuoteItems] = useState<Array<{ name: string; type: string; price: number; quantity: number; startDate: string }>>([
    { name: '5-Day Maasai Mara Safari', type: 'tour', price: 1200, quantity: 1, startDate: new Date().toISOString().split('T')[0] },
  ])
  const [quoteGuests, setQuoteGuests] = useState(2)
  const [quoteCurrency, setQuoteCurrency] = useState('USD')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Initial Load: Fetch Conversations, Agents, register status
  useEffect(() => {
    if (!currentUser) return

    const loadInitialData = async () => {
      try {
        const [convs, agentList] = await Promise.all([
          supportApi.getConversations(),
          supportApi.getAgents(),
        ])
        setConversations(convs)
        setAgents(agentList)

        // Find current agent's status
        const myProfile = agentList.find((a: any) => a.user?._id === currentUser._id)
        if (myProfile) {
          setAgentStatus(myProfile.onlineStatus || 'online')
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }

    loadInitialData()
  }, [currentUser])

  // 2. Setup Agent Socket Listeners
  useEffect(() => {
    if (!currentUser) return

    const socket = connectSupportSocket(currentUser._id)

    // Listen for new messages
    socket.on('new_message', (msg: any) => {
      // Update last message in local conversation list
      setConversations((prev) =>
        prev.map((c) => (c._id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: new Date().toISOString() } : c))
      )

      // Append to active chat if open
      if (activeConvId && msg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        socket.emit('mark_read', { conversationId: activeConvId, userId: currentUser._id })
      }
    })

    // Listen for new conversations
    socket.on('agent_notification', (data: { type: string; conversation?: any; conversationId?: string }) => {
      if (data.type === 'new_conversation' && data.conversation) {
        setConversations((prev) => {
          if (prev.some((c) => c._id === data.conversation._id)) return prev
          return [data.conversation, ...prev]
        })
        toast('New incoming visitor conversation!', { icon: '💬' })
      }

      if (data.type === 'ai_response' || data.type === 'new_message') {
        // Refresh conversation list to get latest message snippet
        supportApi.getConversations().then(setConversations).catch(() => null)
      }
    })

    // Listen for typing events
    socket.on('user_typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (activeConvId && data.conversationId === activeConvId && data.userId !== currentUser._id) {
        setIsVisitorTyping(data.isTyping)
      }
    })

    // Listen for online status updates
    socket.on('online_status', (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => ({ ...prev, [data.userId]: data.isOnline }))
    })

    // Listen for reactions & pins
    socket.on('message_reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m))
      )
    })
    socket.on('message_pin_updated', (data: { messageId: string; isPinned: boolean }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, isPinned: data.isPinned } : m))
      )
    })

    // Listen for note additions
    socket.on('note_added', (note: any) => {
      if (activeConvId && note.conversationId === activeConvId) {
        setNotes((prev) => [...prev, note])
      }
    })

    // Listen for general conversation status/assignment updates
    socket.on('conversation_updated', (updatedConv: any) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updatedConv._id ? updatedConv : c))
      )
      if (activeConvId && updatedConv._id === activeConvId) {
        setActiveConv(updatedConv)
      }
    })

    return () => {
      socket.off('new_message')
      socket.off('agent_notification')
      socket.off('user_typing')
      socket.off('online_status')
      socket.off('message_reaction_updated')
      socket.off('message_pin_updated')
      socket.off('note_added')
      socket.off('conversation_updated')
    }
  }, [currentUser, activeConvId])

  // 3. Fetch Single Conversation History when clicked
  useEffect(() => {
    if (!activeConvId) return

    const loadConvHistory = async () => {
      try {
        const [conv, history] = await Promise.all([
          supportApi.getConversation(activeConvId),
          supportApi.getMessages(activeConvId),
        ])
        setActiveConv(conv)
        setMessages(history.data || [])
        setNotes(conv.notes || [])

        // Prefill Quote Builder guest count & dates from trip builder if available
        if (conv.tripBuilder) {
          setQuoteGuests(conv.tripBuilder.guests || 2)
          if (conv.tripBuilder.destination) {
            setQuoteItems([
              {
                name: `Custom Travel Package: ${conv.tripBuilder.destination}`,
                type: 'tour',
                price: conv.tripBuilder.budget || 1500,
                quantity: conv.tripBuilder.guests || 2,
                startDate: conv.tripBuilder.startDate || new Date().toISOString().split('T')[0],
              },
            ])
          }
        }

        // Join conversation room in socket
        const socket = connectSupportSocket(currentUser!._id)
        socket.emit('join_conversation', { conversationId: activeConvId })
        socket.emit('mark_read', { conversationId: activeConvId, userId: currentUser!._id })
      } catch (err) {
        console.error('Failed to load conversation details:', err)
      }
    }

    loadConvHistory()
  }, [activeConvId])

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isVisitorTyping])

  // Change online status of agent
  const handleStatusChange = async (newStatus: string) => {
    try {
      await supportApi.updateAgentStatus(newStatus)
      setAgentStatus(newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update status.')
    }
  }

  // Assign to me
  const handleAssignToMe = async () => {
    if (!activeConvId || !currentUser) return
    try {
      const conv = await supportApi.assignConversation(activeConvId, currentUser._id)
      setActiveConv(conv)
      toast.success('Conversation assigned to you')
    } catch (err) {
      toast.error('Assignment failed.')
    }
  }

  // Transfer conversation
  const handleTransfer = async (agentId: string) => {
    if (!activeConvId) return
    try {
      const conv = await supportApi.assignConversation(activeConvId, agentId)
      setActiveConv(conv)
      toast.success('Conversation transferred successfully')
    } catch (err) {
      toast.error('Transfer failed.')
    }
  }

  // Change conversation status (Close/Reopen)
  const handleUpdateConvStatus = async (status: string) => {
    if (!activeConvId) return
    try {
      const conv = await supportApi.updateStatus(activeConvId, status)
      setActiveConv(conv)
      toast.success(`Conversation marked as ${status}`)
    } catch (err) {
      toast.error('Status update failed.')
    }
  }

  // Send Message or Internal Note
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConvId) return
    try {
      if (chatMode === 'note') {
        const note = await supportApi.addNote(activeConvId, inputText)
        setNotes((prev) => [...prev, note])
        setInputText('')
      } else {
        const socket = getSupportSocket()
        if (socket && socket.connected) {
          socket.emit('send_message', {
            conversationId: activeConvId,
            senderId: currentUser!._id,
            senderType: 'agent',
            content: inputText,
          })
        } else {
          const saved = await supportApi.sendMessage(activeConvId, {
            senderId: currentUser!._id,
            senderType: 'agent',
            content: inputText,
          })
          setMessages((prev) => [...prev, saved])
        }
        setInputText('')
      }
    } catch (err) {
      toast.error('Message failed to send.')
    }
  }

  // Quote generator
  const handleAddQuoteItem = () => {
    setQuoteItems((prev) => [
      ...prev,
      { name: 'Accommodation Extra', type: 'accommodation', price: 150, quantity: 1, startDate: new Date().toISOString().split('T')[0] },
    ])
  }

  const handleRemoveQuoteItem = (idx: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleQuoteItemChange = (idx: number, field: string, value: any) => {
    setQuoteItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    )
  }

  const handleSendQuotation = async () => {
    if (!activeConvId || !activeConv) return
    try {
      const details = {
        items: quoteItems,
        guestDetails: {
          firstName: activeConv.visitor?.name?.split(' ')[0] || 'Valued',
          lastName: activeConv.visitor?.name?.split(' ').slice(1).join(' ') || 'Guest',
          email: activeConv.visitor?.email || 'guest@tembeaafrica.com',
          phone: activeConv.visitor?.phone || '',
        },
        currency: quoteCurrency,
        startDate: quoteItems[0]?.startDate || new Date().toISOString().split('T')[0],
        guests: quoteGuests,
      }

      await supportApi.generateQuotation(activeConvId, details)
      toast.success('Travel quotation PDF sent inside chat!')
    } catch (err) {
      toast.error('Failed to generate quotation.')
    }
  }

  const handleConvertQuoteToBooking = async () => {
    if (!activeConvId || !activeConv) return
    try {
      const details = {
        items: quoteItems,
        guestDetails: {
          firstName: activeConv.visitor?.name?.split(' ')[0] || 'Valued',
          lastName: activeConv.visitor?.name?.split(' ').slice(1).join(' ') || 'Guest',
          email: activeConv.visitor?.email || 'guest@tembeaafrica.com',
          phone: activeConv.visitor?.phone || '',
        },
        currency: quoteCurrency,
        startDate: quoteItems[0]?.startDate || new Date().toISOString().split('T')[0],
        guests: quoteGuests,
      }

      await supportApi.convertQuoteToBooking(activeConvId, details)
      toast.success('Quotation converted to active database booking!')
    } catch (err) {
      toast.error('Conversion failed. Make sure guest has entered email.')
    }
  }

  // Toggle pinned message
  const handleTogglePin = (messageId: string) => {
    const socket = getSupportSocket()
    if (!socket || !activeConvId) return
    socket.emit('toggle_pin', { messageId, conversationId: activeConvId })
  }

  // File Upload Handler for Agent Console
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !activeConvId) return

    const file = files[0]
    try {
      const uploadRes = await supportApi.uploadFile(file)
      
      const socket = getSupportSocket()
      socket?.emit('send_message', {
        conversationId: activeConvId,
        senderId: currentUser!._id,
        senderType: 'agent',
        content: `Sent file: ${file.name}`,
        attachments: [uploadRes.url],
      })
      
      toast.success('Attachment uploaded and sent!')
    } catch (err) {
      toast.error('File upload failed.')
    }
  }

  // Filters logic
  const filteredConversations = conversations.filter((c) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = c.visitor?.name?.toLowerCase() || ''
      const email = c.visitor?.email?.toLowerCase() || ''
      const topic = c.topic?.toLowerCase() || ''
      if (!name.includes(query) && !email.includes(query) && !topic.includes(query)) return false
    }

    // Assign filter
    if (assignFilter === 'unassigned' && c.assignedAgent) return false
    if (assignFilter === 'mine' && c.assignedAgent?._id !== currentUser?._id) return false

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'archived') {
        return ['closed', 'cancelled', 'booked'].includes(c.status)
      }
      return c.status === statusFilter
    }

    return true
  })

  return (
    <AdminShell title="Support System Console">
      <div className="flex h-[calc(100vh-12rem)] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl overflow-hidden">
        
        {/* PANEL 1: CONVERSATIONS LIST */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/40 dark:bg-gray-950/20">
          {/* Status selector Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
            {/* Agent Availability Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Status</span>
              <select
                value={agentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-medium bg-white dark:bg-gray-800 border rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-safari-600"
              >
                <option value="online">🟢 Online</option>
                <option value="busy">🔴 Busy</option>
                <option value="offline">⚪ Offline</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-safari-600"
              />
            </div>

            {/* Filter segments */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {[
                { label: 'All', value: 'all' },
                { label: 'Unassigned', value: 'unassigned' },
                { label: 'Mine', value: 'mine' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setAssignFilter(tab.value as any)}
                  className={`flex-1 text-center py-1 text-[10px] font-semibold rounded-lg transition-all ${
                    assignFilter === tab.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status filters dropdown */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none font-semibold text-safari-700 outline-none cursor-pointer"
              >
                <option value="all">All Active</option>
                <option value="pending">Pending AI Collection</option>
                <option value="open">Open Chats</option>
                <option value="quoted">Quoted</option>
                <option value="booked">🎉 Booked</option>
                <option value="archived">Archived / Closed</option>
              </select>
            </div>
          </div>

          {/* Conversation Cards Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No conversations match filters.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConvId === conv._id
                const isUserOnline = onlineUsers[conv.visitor?._id] || false
                const dateText = new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full text-left p-4 flex gap-3 transition-colors ${
                      isActive ? 'bg-safari-50/60 dark:bg-safari-950/20 border-l-4 border-safari-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-200">
                        {conv.visitor?.name?.[0] || 'V'}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                        isUserOnline ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {conv.visitor?.name || 'Anonymous Visitor'}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">{dateText}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-1">
                        Topic: {conv.topic || 'Safari Quote Inquiry'}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-[10px] text-gray-400 truncate italic">
                          {conv.lastMessage.content}
                        </p>
                      )}
                      {/* Tags */}
                      {conv.tags && conv.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {conv.tags.map((t) => (
                            <span
                              key={t._id}
                              className="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-md"
                              style={{ backgroundColor: t.color || '#1B4332' }}
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* PANEL 2: CHAT CONSOLE */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {activeConv ? (
            <>
              {/* Active Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-950/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                      {activeConv.visitor?.name || 'Anonymous Visitor'}
                    </h3>
                    <span className="text-xs text-gray-400">({activeConv.visitor?.country || 'Unknown'})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      activeConv.status === 'open' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      activeConv.status === 'quoted' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' :
                      activeConv.status === 'booked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {activeConv.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Topic: {activeConv.topic || 'General'}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Assignment Control */}
                  {!activeConv.assignedAgent ? (
                    <button
                      onClick={handleAssignToMe}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-safari-800 hover:bg-safari-900 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Assign to Me
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Assigned to: <strong className="text-gray-700 dark:text-gray-300">{activeConv.assignedAgent.firstName}</strong>
                      </span>
                      <select
                        onChange={(e) => handleTransfer(e.target.value)}
                        defaultValue=""
                        className="text-xs border rounded-lg px-2 py-1 bg-white dark:bg-gray-800 outline-none"
                      >
                        <option value="" disabled>Transfer...</option>
                        {agents
                          .filter((a) => a.user?._id !== activeConv.assignedAgent?._id)
                          .map((a) => (
                            <option key={a.user?._id} value={a.user?._id}>
                              {a.user?.firstName} {a.user?.lastName} ({a.roles?.[0] || 'Agent'})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Close/Reopen control */}
                  {['closed', 'cancelled', 'booked'].includes(activeConv.status) ? (
                    <button
                      onClick={() => handleUpdateConvStatus('open')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateConvStatus('closed')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 dark:border-rose-950 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Close Chat
                    </button>
                  )}

                  {/* Export Chat log */}
                  <a
                    href={supportApi.exportChatUrl(activeConv._id)}
                    download
                    className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Export Logs"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                </div>
              </div>

              {/* Message History pane */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-950/10 space-y-4">
                {/* Custom system notes or logs */}
                {messages.length === 0 && (
                  <div className="text-center p-8 text-xs text-gray-400">
                    No conversation history. Send a greeting to start.
                  </div>
                )}

                {/* Combine messages & private notes ordered by timestamp */}
                {(() => {
                  const combined = [
                    ...messages.map((m) => ({ ...m, isNote: false })),
                    ...notes.map((n) => ({
                      ...n,
                      isNote: true,
                      senderType: 'agent',
                      senderId: n.agentId?._id,
                      sender: n.agentId,
                      content: `🔒 INTERNAL NOTE: ${n.noteText}`,
                    })),
                  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

                  return combined.map((msg, index) => {
                    const isMe = msg.senderId === currentUser?._id
                    const isSystem = msg.senderType === 'system'
                    const isAI = msg.senderType === 'ai'
                    const isNote = msg.isNote

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex items-start gap-3 ${
                          isSystem ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isMe && !isSystem && (
                          <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold shadow-sm shrink-0">
                            {isAI ? '🦁' : msg.sender?.firstName?.[0] || 'V'}
                          </div>
                        )}

                        <div className={`flex flex-col gap-1 max-w-[70%] ${isSystem ? 'max-w-[90%]' : ''}`}>
                          <div
                            className={`p-3.5 rounded-2xl text-xs relative group ${
                              isSystem
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center text-[10px] rounded-lg'
                                : isNote
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 rounded-br-none shadow-sm'
                                : isMe
                                ? 'bg-safari-800 text-white rounded-br-none shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                            }`}
                          >
                            {/* Pinned label */}
                            {msg.isPinned && (
                              <Pin className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-amber-500 fill-amber-500" />
                            )}

                            {!isSystem && (
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold text-gray-400">
                                <span>{isAI ? 'Tembea AI' : `${msg.sender?.firstName || 'Visitor'} ${msg.sender?.lastName || ''}`}</span>
                                {msg.sender?.role && <span className="px-1 bg-gray-100 dark:bg-gray-700 text-[8px] rounded uppercase">{msg.sender.role}</span>}
                              </div>
                            )}

                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2.5 space-y-1 pt-1.5 border-t border-black/5">
                                {msg.attachments.map((att: any, aIdx: number) => (
                                  <div key={aIdx} className="flex items-center gap-2 bg-black/10 dark:bg-white/15 p-2 rounded-xl text-xs">
                                    <FileText className="w-3.5 h-3.5" />
                                    <a href={att.url} target="_blank" rel="noreferrer" className="underline truncate font-medium flex items-center gap-1">
                                      {att.filename}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Controls */}
                            {!isSystem && !isNote && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity pl-2 z-10 flex gap-1 bg-white dark:bg-gray-800 shadow rounded-lg p-0.5 border">
                                <button
                                  onClick={() => handleTogglePin(msg._id)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  title="Pin Message"
                                >
                                  <Pin className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Message reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 pl-1">
                              {msg.reactions.map((r: any, rIdx: number) => (
                                <span key={rIdx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border">
                                  {r.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {!isSystem && (
                            <span className="text-[9px] text-gray-400 mt-0.5 pl-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}

                {/* Visitor Typing Indicator */}
                {isVisitorTyping && (
                  <div className="flex items-center gap-2.5 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">V</div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Console */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                {/* Switch Reply / Note mode */}
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setChatMode('reply')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      chatMode === 'reply'
                        ? 'bg-safari-800 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Reply Customer
                  </button>
                  <button
                    onClick={() => setChatMode('note')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                      chatMode === 'note'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    Internal Note
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-500" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                    placeholder={chatMode === 'note' ? 'Write private staff note...' : 'Type reply...'}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-safari-600 rounded-2xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-100"
                  />

                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-safari-800 hover:bg-safari-900 text-white rounded-2xl flex items-center justify-center shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 stroke-1 text-gray-300" />
              <h3 className="text-sm font-semibold">No Conversation Selected</h3>
              <p className="text-xs mt-1 text-center max-w-sm">
                Select a visitor conversation from the left panel to begin live consulting or managing custom trip quotes.
              </p>
            </div>
          )}
        </div>

        {/* PANEL 3: VISITOR INFO & TRIP BUILDER */}
        {activeConv && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/40 dark:bg-gray-950/20 overflow-y-auto">
            {/* Visitor Details */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Visitor Profile</h4>
              
              <div className="text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium truncate max-w-[150px]">{activeConv.visitor?.email || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{activeConv.visitor?.phone || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Country:</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {activeConv.visitor?.country || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Device/Browser:</span>
                  <span className="font-medium truncate max-w-[120px]" title={activeConv.visitor?.browser}>
                    {activeConv.visitor?.device || 'Desktop'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Address:</span>
                  <span className="font-mono text-[10px]">{activeConv.visitor?.ip || '127.0.0.1'}</span>
                </div>
              </div>

              {/* Visited page log */}
              {activeConv.visitor?.pagesVisited && activeConv.visitor.pagesVisited.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pages Visited</span>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                    {activeConv.visitor.pagesVisited.map((page: any, pIdx: number) => (
                      <div key={pIdx} className="text-[10px] flex items-center justify-between text-gray-500">
                        <span className="truncate max-w-[140px] font-medium underline" title={page.url}>{page.title}</span>
                        <span className="text-[8px] text-gray-400">{new Date(page.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trip Builder Preferences */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-4 h-4 text-safari-700" />
                Trip Builder Preferences
              </h4>

              <div className="text-xs space-y-3">
                <div>
                  <span className="text-gray-500 block mb-1">Target Destination:</span>
                  <input
                    type="text"
                    defaultValue={activeConv.tripBuilder?.destination || ''}
                    placeholder="e.g. Kenya, Serengeti"
                    className="w-full border rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-xs outline-none"
                    onChange={(e) => {
                      activeConv.tripBuilder = { ...activeConv.tripBuilder, destination: e.target.value }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block mb-1">Start Date:</span>
                    <input
                      type="date"
                      defaultValue={activeConv.tripBuilder?.startDate || ''}
                      className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-[10px] outline-none"
                      onChange={(e) => {
                        activeConv.tripBuilder = { ...activeConv.tripBuilder, startDate: e.target.value }
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Guests:</span>
                    <input
                      type="number"
                      value={quoteGuests}
                      className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-xs outline-none"
                      onChange={(e) => setQuoteGuests(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block mb-1">Per Person Budget:</span>
                    <input
                      type="number"
                      defaultValue={activeConv.tripBuilder?.budget || ''}
                      placeholder="in USD"
                      className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-xs outline-none"
                      onChange={(e) => {
                        activeConv.tripBuilder = { ...activeConv.tripBuilder, budget: parseInt(e.target.value) }
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Currency:</span>
                    <select
                      value={quoteCurrency}
                      onChange={(e) => setQuoteCurrency(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-xs outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KES">KES (Ksh)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotation Builder Items */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  Quotation Items
                </h4>
                <button
                  onClick={handleAddQuoteItem}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 border rounded-lg text-safari-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 border rounded-xl space-y-2 relative group">
                    <button
                      onClick={() => handleRemoveQuoteItem(idx)}
                      className="absolute top-2 right-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div>
                      <input
                        type="text"
                        value={item.name}
                        placeholder="Item name"
                        className="w-full bg-transparent border-none font-semibold text-xs outline-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200"
                        onChange={(e) => handleQuoteItemChange(idx, 'name', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <div>
                        <span className="text-gray-400">Type</span>
                        <select
                          value={item.type}
                          className="w-full border rounded p-1 bg-transparent mt-0.5 outline-none"
                          onChange={(e) => handleQuoteItemChange(idx, 'type', e.target.value)}
                        >
                          <option value="tour">Tour</option>
                          <option value="accommodation">Hotel</option>
                          <option value="transport">Transport</option>
                          <option value="guide">Guide</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-400">Price</span>
                        <input
                          type="number"
                          value={item.price}
                          className="w-full border rounded p-1 bg-transparent mt-0.5 outline-none"
                          onChange={(e) => handleQuoteItemChange(idx, 'price', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <span className="text-gray-400">Qty</span>
                        <input
                          type="number"
                          value={item.quantity}
                          className="w-full border rounded p-1 bg-transparent mt-0.5 outline-none"
                          onChange={(e) => handleQuoteItemChange(idx, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSendQuotation}
                  className="w-full py-2 bg-safari-800 hover:bg-safari-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  ✉️ Send Official Quotation HTML
                </button>
                <button
                  onClick={handleConvertQuoteToBooking}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Convert to Booking & Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  )
}
