import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()
  // body.availabilities is an array of { day_of_week, start_time, end_time }
  // We delete all existing and replace with new ones
  const { availabilities } = body

  // Delete existing
  await supabase.from('availabilities').delete().eq('user_id', userId)

  if (!availabilities || availabilities.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const rows = availabilities.map((a: { day_of_week: number; start_time: string; end_time: string }) => ({
    day_of_week: a.day_of_week,
    start_time: a.start_time,
    end_time: a.end_time,
    user_id: userId,
  }))

  const { data, error } = await supabase
    .from('availabilities')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
