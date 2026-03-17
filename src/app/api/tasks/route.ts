import { NextRequest, NextResponse } from 'next/server'
import { planeApi } from '@/lib/api/plane'

const WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG || 'folly-os'

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('project_id')
  if (!projectId) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  try {
    const data = await planeApi.listWorkItems(WORKSPACE_SLUG, projectId)
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { project_id, ...taskData } = body
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  try {
    const data = await planeApi.createWorkItem(WORKSPACE_SLUG, project_id, taskData)
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
