import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  // Get max position for the column
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('project_id', body.project_id)
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: body.title,
      description: body.description || null,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      position,
      column_id: body.column_id || null,
      due_date: body.due_date || null,
      labels: body.labels || [],
      project_id: body.project_id,
      user_id: userId,
      recurrence: body.recurrence || null,
      recurrence_end_date: body.recurrence_end_date || null,
      next_due_at: body.next_due_at || null,
      notify_before_minutes: body.notify_before_minutes ?? null,
      notify_channels: body.notify_channels || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
