'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings/booking')
  }, [router])

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0F1115]">
      <div className="text-[#8A8F98]">Redirection...</div>
    </div>
  )
}
