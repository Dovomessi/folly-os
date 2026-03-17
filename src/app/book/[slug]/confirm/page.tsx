'use client'

import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, ArrowLeft } from 'lucide-react'
import { BookingPage } from '@/components/booking/booking-page'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function BookingConfirmPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const eventName = searchParams.get('event') || 'Rendez-vous'
  const slotStr = searchParams.get('slot')

  let dateLabel = ''
  let timeLabel = ''
  if (slotStr) {
    try {
      const slotDate = parseISO(slotStr)
      dateLabel = format(slotDate, 'EEEE d MMMM yyyy', { locale: fr })
      timeLabel = format(slotDate, 'HH:mm')
    } catch {
      // ignore parse error
    }
  }

  return (
    <BookingPage>
      <div className="max-w-md mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h1>
        <p className="text-gray-500 mb-6">
          Votre rendez-vous a bien été enregistré. Un email de confirmation vous a été envoyé.
        </p>

        {(dateLabel || eventName) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-left shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#5E6AD2]" />
              <span className="font-semibold text-gray-800 text-sm">{eventName}</span>
            </div>
            {dateLabel && (
              <p className="text-gray-600 text-sm capitalize">{dateLabel}</p>
            )}
            {timeLabel && (
              <p className="text-gray-500 text-sm mt-0.5">à {timeLabel}</p>
            )}
          </div>
        )}

        <Link
          href={`/book/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[#5E6AD2] hover:text-[#4F5BC7] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la page de booking
        </Link>
      </div>
    </BookingPage>
  )
}
