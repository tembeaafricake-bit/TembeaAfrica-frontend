'use client'
import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installPromptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(installPromptEvent)
      
      // Check if user has already dismissed this
      const isDismissed = window.localStorage.getItem('pwa-install-dismissed')
      if (!isDismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistrations()
        if (registration.length === 0) {
          await navigator.serviceWorker.register('/sw.js')
        }
      }

      // Show the install prompt
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        window.localStorage.setItem('pwa-install-dismissed', 'true')
      }

      setShowPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  const handleDismiss = () => {
    window.localStorage.setItem('pwa-install-dismissed', 'true')
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Install prompt */}
            <div className="pr-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-safari-50 dark:bg-safari-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-safari-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Install Tembea Africa</h3>
                  <p className="text-xs text-gray-500">Add it to your home screen for faster access and a more app-like experience.</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-safari-600 hover:bg-safari-700 rounded-lg transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
