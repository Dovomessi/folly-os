import { NextRequest, NextResponse } from 'next/server'
import { calcomApi } from '@/lib/api/calcom'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'bookings'

  try {
    const data = type === 'event-types'
      ? await calcomApi.listEventTypes()
      : await calcomApi.listBookings()
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  try {
    const data = await calcomApi.createBooking(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
