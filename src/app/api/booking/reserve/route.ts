import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email'
import { parseISO, format } from 'date-fns'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const body = await request.json()
  const { slug, event_type_slug, start_time, guest_name, guest_email, guest_phone, notes } = body

  if (!slug || !event_type_slug || !start_time || !guest_name || !guest_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find booking profile by slug
  const { data: profile } = await supabase
    .from('booking_profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const userId = profile.user_id

  // Get event type
  const { data: eventType } = await supabase
    .from('event_types')
    .select('*')
    .eq('slug', event_type_slug)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!eventType) {
    return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
  }

  // Calculate end time
  const startDate = parseISO(start_time)
  const endDate = new Date(startDate.getTime() + eventType.duration_minutes * 60 * 1000)

  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      title: `${eventType.name} — ${guest_name}`,
      description: notes || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      color: eventType.color,
      type: 'meeting',
      status: 'confirmed',
      guest_name,
      guest_email,
      guest_phone: guest_phone || null,
      project_id: null,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get user email for notification
  const { data: { user: hostUser } } = await supabase.auth.admin.getUserById(userId)

  const emailData = {
    guestName: guest_name,
    guestEmail: guest_email,
    eventTitle: eventType.name,
    date: startDate,
    startTime: format(startDate, 'HH:mm'),
    endTime: format(endDate, 'HH:mm'),
    hostName: profile.display_name,
  }

  // Send emails silently (don't crash if email fails)
  try {
    await sendBookingConfirmation(emailData)
  } catch {
    // Email sending failed silently
  }

  if (hostUser?.email) {
    try {
      await sendBookingNotification(emailData, hostUser.email)
    } catch {
      // Email sending failed silently
    }
  }

  return NextResponse.json({ data: appointment }, { status: 201 })
}
