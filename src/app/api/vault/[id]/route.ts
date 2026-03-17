import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encryption'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  const { encrypted_password, ...rest } = data
  let password = ''
  try {
    password = decrypt(encrypted_password)
  } catch {
    password = ''
  }

  return NextResponse.json({ data: { ...rest, password } })
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Build update payload
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.url !== undefined) updates.url = body.url || null
  if (body.username !== undefined) updates.username = body.username || null
  if (body.notes !== undefined) updates.notes = body.notes || null
  if (body.category !== undefined) updates.category = body.category
  if (body.project_id !== undefined) updates.project_id = body.project_id

  // Re-encrypt password only if a new one is provided
  if (body.password) {
    updates.encrypted_password = encrypt(body.password)
  }

  const { data, error } = await supabase
    .from('vault_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { encrypted_password, ...rest } = data
  let password = ''
  try {
    password = decrypt(encrypted_password)
  } catch {
    password = ''
  }

  return NextResponse.json({ data: { ...rest, password } })
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('vault_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
