import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  const { data, error } = await supabase
    .from('event_types')
    .insert({
      name: body.name,
      slug: body.slug,
      duration_minutes: body.duration_minutes || 30,
      color: body.color || '#5E6AD2',
      description: body.description || null,
      is_active: body.is_active !== false,
      buffer_minutes: body.buffer_minutes || 0,
      min_notice_hours: body.min_notice_hours || 1,
      max_days_advance: body.max_days_advance || 30,
      user_id: userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
