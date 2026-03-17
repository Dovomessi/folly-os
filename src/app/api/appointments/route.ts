import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')

  let query = supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (dateFrom) {
    query = query.gte('start_time', dateFrom)
  }

  if (dateTo) {
    query = query.lte('start_time', dateTo)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      title: body.title,
      description: body.description || null,
      start_time: body.start_time,
      end_time: body.end_time,
      color: body.color || '#5E6AD2',
      type: body.type || 'meeting',
      status: body.status || 'confirmed',
      guest_name: body.guest_name || null,
      guest_email: body.guest_email || null,
      guest_phone: body.guest_phone || null,
      project_id: body.project_id || null,
      user_id: userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
