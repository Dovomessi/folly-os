import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch task and note counts for each project
  const projectIds = (projects || []).map((p: { id: string }) => p.id)

  const [tasksResult, notesResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('project_id')
      .in('project_id', projectIds)
      .eq('user_id', userId)
      .neq('status', 'done'),
    supabase
      .from('notes')
      .select('project_id')
      .in('project_id', projectIds)
      .eq('user_id', userId),
  ])

  const taskCountMap: Record<string, number> = {}
  const noteCountMap: Record<string, number> = {}

  for (const t of tasksResult.data || []) {
    taskCountMap[t.project_id] = (taskCountMap[t.project_id] || 0) + 1
  }
  for (const n of notesResult.data || []) {
    noteCountMap[n.project_id] = (noteCountMap[n.project_id] || 0) + 1
  }

  const enriched = (projects || []).map((p: { id: string }) => ({
    ...p,
    task_count: taskCountMap[p.id] || 0,
    note_count: noteCountMap[p.id] || 0,
  }))

  return NextResponse.json({ data: enriched })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
