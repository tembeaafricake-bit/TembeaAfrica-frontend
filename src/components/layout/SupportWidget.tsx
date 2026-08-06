'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  ChevronDown,
  Sparkles,
  User,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  ThumbsUp,
  Pin,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { supportApi, connectSupportSocket, getSupportSocket } from '@/lib/support'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

interface ChatMessage {
  _id: string
  conversationId: string
  senderId: string
  senderType: 'visitor' | 'agent' | 'system' | 'ai'
  content: string
  attachments?: Array<{ url: string; filename: string; fileType: string; size: number }>
  readBy: string[]
  reactions?: Array<{ userId: string; emoji: string }>
  isPinned?: boolean
  createdAt: string
  sender?: {
    firstName: string
    lastName: string
    avatar?: string
    role?: string
  }
}

export function SupportWidget() {
  const pathname = usePathname()
  const { user: authUser } = useAuthStore()

  // Widget States
  const [isOpen, setIsOpen] = useState(false)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<any | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [agentTypingName, setAgentTypingName] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Initialize Visitor Session
  useEffect(() => {
    const initSession = async () => {
      try {
        let storedId = localStorage.getItem('tembea_support_visitor_id')
        
        // Prepare client metrics
        const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
        const referrer = typeof document !== 'undefined' ? document.referrer : ''
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        
        const visitor = await supportApi.initVisitor({
          visitorId: storedId || undefined,
          device: isMobile ? 'Mobile' : 'Desktop',
          browser: userAgent.substring(0, 100),
          referrer: referrer.substring(0, 200),
        })

        if (visitor && visitor._id) {
          localStorage.setItem('tembea_support_visitor_id', visitor._id)
          setVisitorId(visitor._id)

          // Sync authenticated user details if logged in
          if (authUser) {
            await supportApi.updateVisitorProfile(visitor._id, {
              name: `${authUser.firstName} ${authUser.lastName}`,
              email: authUser.email,
              phone: authUser.phone,
            })
          }
        }
      } catch (err) {
        console.error('[SupportWidget] Error initializing visitor session:', err)
      }
    }

    initSession()
  }, [authUser])

  // 2. Track Page Visits
  useEffect(() => {
    if (!visitorId || !pathname) return
    const track = async () => {
      try {
        const title = typeof document !== 'undefined' ? document.title : 'Tembea Africa'
        await supportApi.trackPage(visitorId, pathname, title)
      } catch (err) {
        console.warn('[SupportWidget] Failed to track page visit:', err)
      }
    }
    track()
  }, [visitorId, pathname])

  // 3. Establish Socket Connection
  useEffect(() => {
    if (!visitorId) return

    const socket = connectSupportSocket(visitorId)

    // Listen for new messages
    socket.on('new_message', (msg: ChatMessage) => {
      if (conversation && msg.conversationId === conversation._id) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        
        // Mark as read immediately if chat is open
        if (isOpen) {
          socket.emit('mark_read', { conversationId: conversation._id, userId: visitorId })
        } else {
          setUnreadCount((c) => c + 1)
        }
      }
    })

    // Listen for agent status updates
    socket.on('online_status', (data: { userId: string; isOnline: boolean; status?: string }) => {
      if (conversation?.assignedAgent?._id === data.userId) {
        setIsOnline(data.isOnline && data.status !== 'busy')
      }
    })

    // Listen for typing events
    socket.on('user_typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (conversation && data.conversationId === conversation._id && data.userId !== visitorId) {
        setIsAgentTyping(data.isTyping)
        setAgentTypingName(data.userId === 'ai' ? 'Tembea AI' : 'Agent')
      }
    })

    // Listen for reactions
    socket.on('message_reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m))
      )
    })

    // Listen for pins
    socket.on('message_pin_updated', (data: { messageId: string; isPinned: boolean }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, isPinned: data.isPinned } : m))
      )
    })

    // Listen for conversation changes (assigned agent, status)
    socket.on('conversation_updated', (updatedConv: any) => {
      if (conversation && updatedConv._id === conversation._id) {
        setConversation(updatedConv)
      }
    })

    return () => {
      socket.off('new_message')
      socket.off('online_status')
      socket.off('user_typing')
      socket.off('message_reaction_updated')
      socket.off('message_pin_updated')
      socket.off('conversation_updated')
    }
  }, [visitorId, conversation, isOpen])

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAgentTyping])

  // 4. Start Chat
  const handleStartChat = async (initialTopic = 'Travel Inquiry') => {
    let currentVisitorId = visitorId
    
    // Self-healing: if visitorId isn't initialized yet, try to initialize it immediately
    if (!currentVisitorId) {
      try {
        const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
        const referrer = typeof document !== 'undefined' ? document.referrer : ''
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        const visitor = await supportApi.initVisitor({
          device: isMobile ? 'Mobile' : 'Desktop',
          browser: userAgent.substring(0, 100),
          referrer: referrer.substring(0, 200),
        })
        if (visitor && visitor._id) {
          localStorage.setItem('tembea_support_visitor_id', visitor._id)
          setVisitorId(visitor._id)
          currentVisitorId = visitor._id
        }
      } catch (e) {
        console.error('[SupportWidget] Immediate visitor init failed:', e)
      }
    }

    if (!currentVisitorId) {
      toast.error('Could not connect to live chat. Please refresh the page.')
      return
    }

    try {
      const conv = await supportApi.startConversation(currentVisitorId, initialTopic)
      setConversation(conv)
      
      // Join conversation room in socket
      const socket = connectSupportSocket(currentVisitorId)
      socket.emit('join_conversation', { conversationId: conv._id })

      // Fetch message history
      const history = await supportApi.getMessages(conv._id)
      setMessages(history.data || [])
    } catch (err: any) {
      // Clear localStorage and retry once on failure (e.g. database reset or visitor not found)
      console.warn('[SupportWidget] Start conversation failed, triggering self-healing recovery:', err)
      localStorage.removeItem('tembea_support_visitor_id')
      setVisitorId(null)
      
      try {
        const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
        const referrer = typeof document !== 'undefined' ? document.referrer : ''
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        
        const visitor = await supportApi.initVisitor({
          device: isMobile ? 'Mobile' : 'Desktop',
          browser: userAgent.substring(0, 100),
          referrer: referrer.substring(0, 200),
        })
        if (visitor && visitor._id) {
          localStorage.setItem('tembea_support_visitor_id', visitor._id)
          setVisitorId(visitor._id)
          
          const conv = await supportApi.startConversation(visitor._id, initialTopic)
          setConversation(conv)
          
          const socket = connectSupportSocket(visitor._id)
          socket.emit('join_conversation', { conversationId: conv._id })
          
          const history = await supportApi.getMessages(conv._id)
          setMessages(history.data || [])
          return
        }
      } catch (retryErr) {
        console.error('[SupportWidget] Recovery attempt failed:', retryErr)
      }
      
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown connection error'
      toast.error(`Could not connect: ${errMsg}`)
      console.error('[SupportWidget] Start chat error details:', err)
    }
  }

  // 5. Send Message
  const handleSendMessage = async (textToSend?: string, attachmentUrls: string[] = []) => {
    const text = textToSend !== undefined ? textToSend : inputMessage
    if (!text.trim() && attachmentUrls.length === 0) return
    if (!conversation || !visitorId) return

    try {
      const socket = getSupportSocket()
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversationId: conversation._id,
          senderId: visitorId,
          senderType: 'visitor',
          content: text,
          attachments: attachmentUrls,
        })
      } else {
        // Fallback REST
        const saved = await supportApi.sendMessage(conversation._id, {
          senderId: visitorId,
          senderType: 'visitor',
          content: text,
          attachments: attachmentUrls,
        })
        setMessages((prev) => [...prev, saved])
      }

      if (textToSend === undefined) {
        setInputMessage('')
      }
      
      // Stop typing emitter
      emitTyping(false)
    } catch (err) {
      toast.error('Failed to send message.')
      console.error(err)
    }
  }

  // 6. Handle Quick Actions
  const handleQuickAction = async (action: string) => {
    let topic = 'Trip Planning'
    if (action.includes('Quote')) topic = 'Request Quotation'
    if (action.includes('Transfer')) topic = 'Airport Transfers'

    await handleStartChat(topic)

    let chatText = ''
    if (action.includes('Agent')) {
      chatText = 'I would like to talk to a human agent please.'
    } else {
      chatText = `I am interested in: ${action}`
    }

    setTimeout(() => {
      handleSendMessage(chatText)
    }, 500)
  }

  // Emit typing indicator
  const typingTimeoutRef = useRef<any>(null)
  const emitTyping = (isTyping: boolean) => {
    const socket = getSupportSocket()
    if (!socket || !conversation || !visitorId) return
    socket.emit('typing', {
      conversationId: conversation._id,
      userId: visitorId,
      isTyping,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    emitTyping(true)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false)
    }, 1500)
  }

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!conversation) await handleStartChat('File Attachment Support')

    setIsUploading(true)
    const file = files[0]
    
    try {
      const uploadRes = await supportApi.uploadFile(file)
      await handleSendMessage(`Uploaded attachment: ${file.name}`, [uploadRes.url])
      toast.success('File uploaded successfully!')
    } catch (err) {
      toast.error('File upload failed. Ensure server is online.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  // Add Reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    const socket = getSupportSocket()
    if (!socket || !conversation || !visitorId) return
    socket.emit('add_reaction', {
      messageId,
      userId: visitorId,
      emoji,
      conversationId: conversation._id,
    })
  }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-safari-800 to-safari-900 text-white p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">
                  {conversation?.assignedAgent ? '👤' : '🦁'}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {conversation?.assignedAgent
                      ? `${conversation.assignedAgent.firstName} ${conversation.assignedAgent.lastName}`
                      : 'Tembea Support AI'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400 animate-pulse'}`} />
                    <span className="text-xs text-white/70">
                      {conversation?.assignedAgent
                        ? (isOnline ? 'Online' : 'Offline / Away')
                        : 'Instant Assistant'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/20">
              {!conversation ? (
                // Greeting & Quick Actions
                <div className="space-y-6 pt-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">👋 Welcome to Tembea Africa</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">How can we help you plan your journey today?</p>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Quick Actions</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: '🏨 Find Accommodation', action: 'Find Accommodation' },
                        { label: '🦁 Plan a Safari', action: 'Plan a Safari' },
                        { label: '🚗 Airport Transfers', action: 'Airport Transfers' },
                        { label: '🏝️ Beach Holidays', action: 'Beach Holidays' },
                        { label: '📅 Request a Quote', action: 'Request a Quote' },
                        { label: '💬 Talk to an Agent', action: 'Talk to an Agent' },
                      ].map((btn) => (
                        <button
                          key={btn.action}
                          onClick={() => handleQuickAction(btn.action)}
                          className="w-full text-left p-3.5 bg-white dark:bg-gray-800 hover:bg-safari-50 dark:hover:bg-safari-900/30 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-safari-200 dark:hover:border-safari-800 transition-all flex items-center justify-between group shadow-sm"
                        >
                          <span>{btn.label}</span>
                          <span className="text-gray-300 group-hover:text-safari-600 transition-colors">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Message List
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isMe = msg.senderId === visitorId
                    const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId

                    return (
                      <div key={msg._id || index} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && showAvatar && (
                          <div className="w-8 h-8 rounded-xl bg-safari-100 dark:bg-safari-900 flex items-center justify-center text-xs font-semibold select-none shadow-sm">
                            {msg.senderType === 'ai' ? '🦁' : msg.sender?.firstName?.[0] || 'A'}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-8" />}

                        <div className="flex flex-col gap-1 max-w-[70%]">
                          {/* Message bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-sm shadow-sm relative group transition-all ${
                              isMe
                                ? 'bg-safari-800 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-none'
                            }`}
                          >
                            {/* Pinned Indicator */}
                            {msg.isPinned && (
                              <Pin className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-amber-500 fill-amber-500" />
                            )}

                            {/* Render text or attachments */}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {/* Attachments list */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2.5 space-y-1.5 border-t border-white/10 pt-2">
                                {msg.attachments.map((att: any, aIdx: number) => {
                                  const isImg = att.fileType === 'image'
                                  return (
                                    <div key={aIdx} className="flex items-center gap-2 bg-black/10 dark:bg-white/10 p-2 rounded-xl text-xs">
                                      {isImg ? <ImageIcon className="w-3.5 h-3.5 shrink-0" /> : <FileText className="w-3.5 h-3.5 shrink-0" />}
                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline truncate font-medium hover:text-safari-300 transition-colors flex items-center gap-1"
                                      >
                                        {att.filename}
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Simple Quick reaction buttons */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity pl-2 z-10 flex gap-1">
                              <button
                                onClick={() => handleAddReaction(msg._id, '👍')}
                                className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border shadow flex items-center justify-center text-xs hover:scale-110 transition-transform"
                              >
                                👍
                              </button>
                            </div>
                          </div>

                          {/* Reaction badge */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 pl-1">
                              {msg.reactions.map((r, rIdx) => (
                                <span key={rIdx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm border dark:border-gray-700">
                                  {r.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Message metadata */}
                          <div className={`flex items-center gap-1.5 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              <span>
                                {msg.readBy.length > 1 ? '✓ Seen' : '✓ Sent'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Typing Indicator */}
                  {isAgentTyping && (
                    <div className="flex items-center gap-2.5 justify-start">
                      <div className="w-8 h-8 rounded-xl bg-safari-100 dark:bg-safari-900 flex items-center justify-center text-xs">
                        {agentTypingName === 'Tembea AI' ? '🦁' : '👤'}
                      </div>
                      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Footer */}
            {conversation && (
              <div className="p-3.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                {/* Escalation bar if AI chat */}
                {conversation.status === 'pending' && !conversation.assignedAgent && (
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Waiting for a travel consultant...
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-10 h-10 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-safari-600 rounded-2xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    className="w-10 h-10 rounded-2xl bg-safari-800 hover:bg-safari-900 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Toggle Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen)
          setUnreadCount(0)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-safari-800 to-safari-900 text-white shadow-2xl flex items-center justify-center hover:shadow-safari-800/25 relative border border-white/10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              {/* Online Indicator Badge */}
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-safari-900 absolute -bottom-1 -right-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  )
}
export default SupportWidget
