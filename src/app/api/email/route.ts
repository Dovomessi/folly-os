import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email'
import { parseISO, format } from 'date-fns'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, data, hostEmail } = body

  if (!type || !data) {
    return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
  }

  const emailData = {
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    eventTitle: data.eventTitle,
    date: parseISO(data.date),
    startTime: data.startTime,
    endTime: data.endTime,
    hostName: data.hostName,
  }

  try {
    if (type === 'confirmation') {
      await sendBookingConfirmation(emailData)
    } else if (type === 'notification' && hostEmail) {
      await sendBookingNotification(emailData, hostEmail)
    } else {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Email sending failed' }, { status: 500 })
  }
}
