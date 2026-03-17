import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

const DEFAULT_COLUMNS = [
  { name: 'A faire', position: 0, status: 'todo' },
  { name: 'En cours', position: 1, status: 'in_progress' },
  { name: 'En revue', position: 2, status: 'in_review' },
  { name: 'Termine', position: 3, status: 'done' },
]

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  let { data, error } = await supabase
    .from('task_columns')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-create default columns if none exist
  if (!data || data.length === 0) {
    const toInsert = DEFAULT_COLUMNS.map(col => ({
      ...col,
      project_id: projectId,
      user_id: userId,
    }))

    const { data: created, error: createError } = await supabase
      .from('task_columns')
      .insert(toInsert)
      .select()

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
    data = created
  }

  // Ensure status is populated for legacy columns that may have NULL status
  if (data && data.length > 0) {
    const statusMap = ['todo', 'in_progress', 'in_review', 'done']
    data = data.map((col: any, i: number) => ({
      ...col,
      status: col.status || statusMap[i] || 'todo'
    }))
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  const { data, error } = await supabase
    .from('task_columns')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
