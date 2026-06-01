import Navbar from '@/components/Navbar'
import SwipeNavigation from '@/components/SwipeNavigation'
import FloatingQuickAdd from '@/components/FloatingQuickAdd'

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <SwipeNavigation>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </SwipeNavigation>
      <FloatingQuickAdd />
    </>
  )
}
