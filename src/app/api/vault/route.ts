import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'
import { encrypt, decrypt } from '@/lib/encryption'

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
    .from('vault_items')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrypt passwords — never expose encrypted_password to client
  const items = (data || []).map(item => {
    const { encrypted_password, ...rest } = item
    let password = ''
    try {
      password = decrypt(encrypted_password)
    } catch {
      password = ''
    }
    return { ...rest, password }
  })

  return NextResponse.json({ data: items })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!body.password) {
    return NextResponse.json({ error: 'password is required' }, { status: 400 })
  }

  const encrypted_password = encrypt(body.password)

  const { data, error } = await supabase
    .from('vault_items')
    .insert({
      name: body.name.trim(),
      url: body.url || null,
      username: body.username || null,
      encrypted_password,
      notes: body.notes || null,
      category: body.category || 'other',
      project_id: body.project_id,
      user_id: userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { encrypted_password: _ep, ...rest } = data
  return NextResponse.json({ data: { ...rest, password: body.password } }, { status: 201 })
}
