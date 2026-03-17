const DOCMOST_BASE_URL = process.env.DOCMOST_BASE_URL || ''
const DOCMOST_API_KEY = process.env.DOCMOST_API_KEY || ''

async function docmostRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${DOCMOST_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DOCMOST_API_KEY}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Docmost API error: ${res.status}`)
  return res.json()
}

export const docmostApi = {
  listSpaces: () => docmostRequest('/spaces'),
  listPages: (spaceId: string) => docmostRequest(`/spaces/${spaceId}/pages`),
  createPage: (spaceId: string, data: Record<string, unknown>) =>
    docmostRequest(`/spaces/${spaceId}/pages`, { method: 'POST', body: JSON.stringify(data) }),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${DOCMOST_BASE_URL}`, { signal: AbortSignal.timeout(5000) })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
