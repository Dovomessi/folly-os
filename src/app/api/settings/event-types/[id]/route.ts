import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  const { data, error } = await supabase
    .from('event_types')
    .update({
      name: body.name,
      slug: body.slug,
      duration_minutes: body.duration_minutes,
      color: body.color,
      description: body.description || null,
      is_active: body.is_active,
      buffer_minutes: body.buffer_minutes,
      min_notice_hours: body.min_notice_hours,
      max_days_advance: body.max_days_advance,
    })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
