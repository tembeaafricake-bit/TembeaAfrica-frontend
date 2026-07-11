'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

type InstallButtonProps = {
  className?: string
}

export default function InstallButton({ className = 'inline-flex items-center gap-2 rounded-full bg-safari-700 px-4 py-2 text-sm font-semibold text-white hover:bg-safari-800 transition-colors' }: InstallButtonProps) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    const handleAppInstalled = () => {
      setShowButton(false)
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!promptEvent) return

    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === 'accepted') {
      setShowButton(false)
      setPromptEvent(null)
    }
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className={className}
      aria-label="Install the Tembea Africa app"
    >
      Install app
    </button>
  )
}
