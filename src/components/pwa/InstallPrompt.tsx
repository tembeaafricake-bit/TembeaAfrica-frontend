'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [permissionNoticeVisible, setPermissionNoticeVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const dismissed = window.localStorage.getItem('tembea-install-dismissed')
    if (dismissed) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      window.setTimeout(() => setVisible(true), 1200)
      window.setTimeout(() => setPermissionNoticeVisible(true), 2200)
    }

    const handleAppInstalled = () => {
      setVisible(false)
      setPermissionNoticeVisible(false)
      setDeferredPrompt(null)
      window.localStorage.setItem('tembea-install-dismissed', 'true')
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      window.localStorage.setItem('tembea-install-dismissed', 'true')
    }
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    window.localStorage.setItem('tembea-install-dismissed', 'true')
    setVisible(false)
    setPermissionNoticeVisible(false)
  }

  return (
    <>
      {permissionNoticeVisible && (
        <div className="fixed bottom-24 left-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-safari-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-safari-700 text-xl text-white">🔐</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Permission notice</p>
              <p className="mt-1 text-sm text-gray-600">Tembea Africa may ask for limited browser permission when you install or use the app on supported devices. This does not access your personal data without your approval.</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setPermissionNoticeVisible(false)} className="rounded-xl bg-safari-700 px-3 py-2 text-sm font-semibold text-white">Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {visible && (
        <div className="fixed bottom-4 left-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-safari-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-safari-700 text-xl text-white">🦁</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Install Tembea Africa</p>
          <p className="mt-1 text-sm text-gray-600">Add it to your home screen for faster access and a more app-like experience.</p>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={handleInstall} className="rounded-xl bg-safari-700 px-3 py-2 text-sm font-semibold text-white">Install</button>
            <button onClick={handleDismiss} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600">Maybe later</button>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  )
}
