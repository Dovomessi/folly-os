import { NextResponse } from 'next/server'
import { planeApi } from '@/lib/api/plane'
import { calcomApi } from '@/lib/api/calcom'
import { docmostApi } from '@/lib/api/docmost'
import { vaultwardenApi } from '@/lib/api/vaultwarden'

export async function GET() {
  const [plane, calcom, docmost, vaultwarden] = await Promise.all([
    planeApi.healthCheck(),
    calcomApi.healthCheck(),
    docmostApi.healthCheck(),
    vaultwardenApi.healthCheck(),
  ])

  return NextResponse.json({
    services: {
      plane: { service: 'plane', ...plane },
      calcom: { service: 'calcom', ...calcom },
      docmost: { service: 'docmost', ...docmost },
      vaultwarden: { service: 'vaultwarden', ...vaultwarden },
    },
    all_up: [plane, calcom, docmost, vaultwarden].every(s => s.status === 'up'),
  })
}
