'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsIOS(ios)
    setIsStandalone(standalone)

    if (standalone) return

    if (ios) {
      setShowBanner(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setShowBanner(false)
  }

  if (!showBanner || isStandalone) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-lg mx-auto bg-[#111111] border border-[#1a8cff]/40 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📲</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Instale o app na tela inicial</p>
            {isIOS ? (
              <p className="text-slate-400 text-xs mt-1">
                No Safari: toque em{' '}
                <span className="inline-block text-white">Compartilhar</span>{' '}
                →{' '}
                <span className="inline-block text-white">Adicionar à Tela de Início</span>
              </p>
            ) : (
              <p className="text-slate-400 text-xs mt-1">
                Acesse o app rapidamente mesmo sem internet
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="bg-[#1a8cff] hover:bg-[#3399ff] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Instalar
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-slate-500 hover:text-white p-1 transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
