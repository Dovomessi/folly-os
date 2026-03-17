const CALCOM_BASE_URL = process.env.CALCOM_BASE_URL || ''
const CALCOM_API_KEY = process.env.CALCOM_API_KEY || ''

async function calcomRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${CALCOM_BASE_URL}/v2${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CALCOM_API_KEY}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Cal.com API error: ${res.status}`)
  return res.json()
}

export const calcomApi = {
  listEventTypes: () => calcomRequest('/event-types'),

  listBookings: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : ''
    return calcomRequest(`/bookings${query}`)
  },

  createBooking: (data: Record<string, unknown>) =>
    calcomRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${CALCOM_BASE_URL}/v2/me`, {
        headers: { 'Authorization': `Bearer ${CALCOM_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
