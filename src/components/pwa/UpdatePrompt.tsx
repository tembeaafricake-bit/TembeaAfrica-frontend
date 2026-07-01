"use client"
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function UpdatePrompt() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      if (reg.waiting) {
        setWaitingSW(reg.waiting)
        showToast(reg.waiting)
      }

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing
        if (!newSW) return
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingSW(newSW)
            showToast(newSW)
          }
        })
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  function showToast(sw: ServiceWorker) {
    toast((t) => (
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-4 py-3 flex items-center gap-3">
        <div className="flex-1">A new version is available.</div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            sw.postMessage({ type: 'SKIP_WAITING' })
            toast.dismiss(t.id)
          }} className="bg-safari-700 text-white px-3 py-1 rounded-md">Refresh</button>
          <button onClick={() => toast.dismiss(t.id)} className="text-sm opacity-70">Dismiss</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  return null
}
