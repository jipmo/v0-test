"use client"

import React from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = React.useState(true)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false)

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
      if (deferredPrompt) {
        setShowInstallPrompt(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [deferredPrompt])

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.log("[v0] Service worker registration failed:", error)
      })
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`[v0] User response: ${outcome}`)
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-4xl font-bold text-accent-brand animate-pulse">아마따</div>
      </div>
    )
  }

  return (
    <>
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">앱 설치</h2>
            <p className="text-gray-600 mb-6">아마따 앱을 홈 화면에 추가하시겠어요?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                나중에
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-accent-brand text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                설치
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
