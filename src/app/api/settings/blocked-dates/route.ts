import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const body = await request.json()

  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({
      date: body.date,
      reason: body.reason || null,
      user_id: userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, supabase } = auth

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
