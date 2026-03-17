import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  // body.availabilities is an array of { day_of_week, start_time, end_time }
  // We delete all existing and replace with new ones
  const { availabilities } = body

  // Delete existing
  await supabase.from('availabilities').delete().eq('user_id', user.id)

  if (!availabilities || availabilities.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const rows = availabilities.map((a: { day_of_week: number; start_time: string; end_time: string }) => ({
    day_of_week: a.day_of_week,
    start_time: a.start_time,
    end_time: a.end_time,
    user_id: user.id,
  }))

  const { data, error } = await supabase
    .from('availabilities')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
