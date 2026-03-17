import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/booking'
import { parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const eventTypeSlug = searchParams.get('event_type_slug')
  const dateStr = searchParams.get('date')

  if (!slug || !eventTypeSlug || !dateStr) {
    return NextResponse.json({ error: 'Missing params: slug, event_type_slug, date' }, { status: 400 })
  }

  // Find booking profile by slug
  const { data: profile, error: profileError } = await supabase
    .from('booking_profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const userId = profile.user_id

  // Get event type
  const { data: eventType, error: etError } = await supabase
    .from('event_types')
    .select('*')
    .eq('slug', eventTypeSlug)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (etError || !eventType) {
    return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
  }

  // Get availabilities
  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', userId)

  // Get existing appointments for that day (and surrounding days for buffer)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', `${dateStr}T00:00:00`)
    .lte('start_time', `${dateStr}T23:59:59`)

  // Get blocked dates
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('user_id', userId)

  const date = parseISO(dateStr)
  const slots = getAvailableSlots(
    date,
    eventType,
    availabilities || [],
    appointments || [],
    blockedDates || []
  )

  return NextResponse.json({ data: slots.map(s => ({ start: s.start.toISOString(), end: s.end.toISOString(), formatted: s.formatted })) })
}
