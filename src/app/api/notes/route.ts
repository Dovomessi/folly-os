import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const search = searchParams.get('search')

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
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
    .from('notes')
    .insert({
      title: body.title || 'Sans titre',
      content: body.content || '',
      content_html: body.content_html || '',
      is_pinned: body.is_pinned || false,
      template: body.template || null,
      word_count: body.word_count || 0,
      project_id: body.project_id,
      user_id: userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
