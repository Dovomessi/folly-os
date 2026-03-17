'use client'

import type { ReactNode } from 'react'

interface BookingPageProps {
  children: ReactNode
}

export function BookingPage({ children }: BookingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#5E6AD2] flex items-center justify-center">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <span className="text-gray-800 font-semibold text-sm">Folly OS</span>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
