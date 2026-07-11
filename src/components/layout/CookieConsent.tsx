'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Shield } from 'lucide-react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    const choice = localStorage.getItem('cookie-consent-choice')
    if (!choice) {
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent-choice', 'all')
    localStorage.setItem('cookie-preferences', JSON.stringify({ essential: true, analytics: true, marketing: true }))
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent-choice', 'essential')
    localStorage.setItem('cookie-preferences', JSON.stringify({ essential: true, analytics: false, marketing: false }))
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent-choice', 'custom')
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences))
    setShowBanner(false)
    setShowCustomize(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[100] font-sans"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {!showCustomize ? (
              <div>
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-safari-50 dark:bg-safari-900/20 text-safari-600 dark:text-safari-400 grid place-items-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-safari-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">Cookie settings</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                      We use cookies to secure authentication, analyze site traffic, and deliver personalized travel recommendations.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                  <button
                    onClick={handleReject}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-safari-600 dark:text-safari-400 bg-safari-50 hover:bg-safari-100 dark:bg-safari-900/20 dark:hover:bg-safari-900/40 rounded-xl transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-safari-700 hover:bg-safari-800 rounded-xl transition-colors shadow-sm"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-safari-600" />
                    Customize preferences
                  </h4>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 my-4">
                  {/* Essential */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Required (Authentication)</span>
                      <p className="text-[10px] text-gray-450 dark:text-gray-400 mt-0.5 leading-relaxed">Necessary to log in, book tours, and keep your session secure. Cannot be turned off.</p>
                    </div>
                    <input type="checkbox" checked disabled className="rounded text-safari-600 cursor-not-allowed opacity-60 mt-1" />
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Performance & Analytics</span>
                      <p className="text-[10px] text-gray-455 dark:text-gray-400 mt-0.5 leading-relaxed">Allows us to track page visits and improve our booking platform experience.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="rounded text-safari-600 cursor-pointer mt-1"
                    />
                  </div>

                  {/* Marketing */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Marketing & Recommendations</span>
                      <p className="text-[10px] text-gray-455 dark:text-gray-400 mt-0.5 leading-relaxed">Helps us suggest travel destinations and tours matching your travel style.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="rounded text-safari-600 cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-safari-700 hover:bg-safari-800 rounded-xl transition-colors"
                  >
                    Save choice
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
