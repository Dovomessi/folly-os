const VAULTWARDEN_BASE_URL = process.env.VAULTWARDEN_BASE_URL || ''
const VAULTWARDEN_ADMIN_TOKEN = process.env.VAULTWARDEN_ADMIN_TOKEN || ''

export const vaultwardenApi = {
  listUsers: async () => {
    const res = await fetch(`${VAULTWARDEN_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${VAULTWARDEN_ADMIN_TOKEN}` },
    })
    if (!res.ok) throw new Error(`Vaultwarden API error: ${res.status}`)
    return res.json()
  },

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${VAULTWARDEN_BASE_URL}/alive`, { signal: AbortSignal.timeout(5000) })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
