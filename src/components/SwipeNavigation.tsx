'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const NAV_ORDER = ['/', '/customers', '/funil', '/follow-ups', '/tags']

export default function SwipeNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const pullStart = useRef<number | null>(null)
  const pullIndicatorRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    if (window.scrollY === 0) pullStart.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (pullStart.current !== null && window.scrollY === 0) {
      const pullDist = e.touches[0].clientY - pullStart.current
      if (pullDist > 0 && pullIndicatorRef.current) {
        const progress = Math.min(pullDist / 80, 1)
        pullIndicatorRef.current.style.transform = `translateY(${Math.min(pullDist * 0.4, 32)}px)`
        pullIndicatorRef.current.style.opacity = String(progress)
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y

    // Pull-to-refresh
    if (pullStart.current !== null) {
      const pullDist = e.changedTouches[0].clientY - pullStart.current
      if (pullIndicatorRef.current) {
        pullIndicatorRef.current.style.transform = 'translateY(0)'
        pullIndicatorRef.current.style.opacity = '0'
      }
      if (pullDist > 80 && Math.abs(dx) < 50) {
        window.location.reload()
        pullStart.current = null
        touchStart.current = null
        return
      }
      pullStart.current = null
    }

    // Horizontal swipe to change tab
    if (Math.abs(dx) > 60 && Math.abs(dy) < 80) {
      const idx = NAV_ORDER.findIndex(p => p === pathname || (p !== '/' && pathname.startsWith(p)))
      if (idx === -1) return
      if (dx < 0 && idx < NAV_ORDER.length - 1) router.push(NAV_ORDER[idx + 1])
      if (dx > 0 && idx > 0) router.push(NAV_ORDER[idx - 1])
    }

    touchStart.current = null
  }, [pathname, router])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Pull-to-refresh indicator */}
      <div
        ref={pullIndicatorRef}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-[#1a8cff] shadow-lg opacity-0 transition-none"
        style={{ transform: 'translateY(0)', opacity: 0 }}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      {children}
    </div>
  )
}
