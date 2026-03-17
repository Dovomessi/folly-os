import { NextResponse } from 'next/server'
import { vaultwardenApi } from '@/lib/api/vaultwarden'

export async function GET() {
  try {
    const data = await vaultwardenApi.listUsers()
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
