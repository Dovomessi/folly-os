import { NextRequest, NextResponse } from 'next/server'
import { docmostApi } from '@/lib/api/docmost'

export async function GET(request: NextRequest) {
  const spaceId = request.nextUrl.searchParams.get('space_id')

  try {
    const data = spaceId
      ? await docmostApi.listPages(spaceId)
      : await docmostApi.listSpaces()
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { space_id, ...pageData } = body
  if (!space_id) return NextResponse.json({ error: 'space_id required' }, { status: 400 })

  try {
    const data = await docmostApi.createPage(space_id, pageData)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
