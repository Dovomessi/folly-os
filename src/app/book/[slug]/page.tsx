'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Clock, ArrowLeft } from 'lucide-react'
import { BookingPage } from '@/components/booking/booking-page'
import { DatePicker } from '@/components/booking/date-picker'
import { TimeSlots } from '@/components/booking/time-slots'
import { BookingForm } from '@/components/booking/booking-form'
import type { EventType, Availability, BlockedDate, BookingProfile } from '@/types'
import { createClient } from '@supabase/supabase-js'

// Supabase public client (anon key, read-only public data)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type Step = 'select-type' | 'select-datetime' | 'booking-form'

export default function BookingSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [profile, setProfile] = useState<BookingProfile | null>(null)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState<Step>('select-type')
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [slug])

  async function fetchProfile() {
    setLoading(true)
    const supabase = getSupabase()

    // Get profile
    const { data: profileData, error } = await supabase
      .from('booking_profiles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const userId = profileData.user_id

    // Fetch event types, availabilities, blocked dates in parallel
    const [etRes, availRes, blockedRes] = await Promise.all([
      supabase.from('event_types').select('*').eq('user_id', userId).eq('is_active', true).order('created_at'),
      supabase.from('availabilities').select('*').eq('user_id', userId),
      supabase.from('blocked_dates').select('*').eq('user_id', userId),
    ])

    setEventTypes(etRes.data || [])
    setAvailabilities(availRes.data || [])
    setBlockedDates(blockedRes.data || [])
    setLoading(false)
  }

  function handleSelectEventType(et: EventType) {
    setSelectedEventType(et)
    setSelectedDate(null)
    setSelectedSlot(null)
    setStep('select-datetime')
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  function handleSelectSlot(start: string) {
    setSelectedSlot(start)
    setStep('booking-form')
  }

  function handleBookingSuccess(appointmentId: string) {
    router.push(`/book/${slug}/confirm?event=${selectedEventType?.name || ''}&slot=${selectedSlot || ''}`)
  }

  if (loading) {
    return (
      <BookingPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin" />
        </div>
      </BookingPage>
    )
  }

  if (notFound || !profile) {
    return (
      <BookingPage>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Page introuvable</h2>
          <p className="text-gray-500">Ce lien de booking n&apos;existe pas ou a été désactivé.</p>
        </div>
      </BookingPage>
    )
  }

  return (
    <BookingPage>
      {/* Profile header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#5E6AD2] flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-white text-2xl font-bold">
            {profile.display_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
        {profile.bio && (
          <p className="text-gray-500 mt-1.5 max-w-md mx-auto text-sm">{profile.bio}</p>
        )}
      </div>

      {/* Step: Select Event Type */}
      {step === 'select-type' && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Choisissez un type de rendez-vous</h2>
          {eventTypes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Aucun rendez-vous disponible pour le moment.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {eventTypes.map(et => (
                <button
                  key={et.id}
                  onClick={() => handleSelectEventType(et)}
                  className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[#5E6AD2] hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: et.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-[#5E6AD2] transition-colors">
                        {et.name}
                      </h3>
                      {et.description && (
                        <p className="text-gray-500 text-sm mt-0.5">{et.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{et.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Select Date + Time */}
      {step === 'select-datetime' && selectedEventType && (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setStep('select-type')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour aux types
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedEventType.color }}
              />
              <h2 className="text-lg font-semibold text-gray-800">{selectedEventType.name}</h2>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedEventType.duration_minutes} minutes</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Sélectionnez une date</h3>
              <DatePicker
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                availabilities={availabilities}
                blockedDates={blockedDates}
                eventType={selectedEventType}
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Choisissez un créneau</h3>
                <TimeSlots
                  date={selectedDate}
                  profileSlug={slug}
                  eventTypeSlug={selectedEventType.slug}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSelectSlot}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step: Booking Form */}
      {step === 'booking-form' && selectedEventType && selectedDate && selectedSlot && (
        <div className="max-w-md mx-auto">
          <BookingForm
            eventType={selectedEventType}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            profileSlug={slug}
            hostName={profile.display_name}
            onBack={() => setStep('select-datetime')}
            onSuccess={handleBookingSuccess}
          />
        </div>
      )}
    </BookingPage>
  )
}
