const PLANE_BASE_URL = process.env.PLANE_BASE_URL || ''
const PLANE_API_KEY = process.env.PLANE_API_KEY || ''

async function planeRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${PLANE_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': PLANE_API_KEY,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Plane API error: ${res.status}`)
  return res.json()
}

export const planeApi = {
  listProjects: (workspaceSlug: string) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/`),

  listWorkItems: (workspaceSlug: string, projectId: string) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/${projectId}/work-items/`),

  createWorkItem: (workspaceSlug: string, projectId: string, data: Record<string, unknown>) =>
    planeRequest(`/workspaces/${workspaceSlug}/projects/${projectId}/work-items/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  healthCheck: async () => {
    try {
      const start = Date.now()
      await fetch(`${PLANE_BASE_URL}/`, { signal: AbortSignal.timeout(5000) })
      return { status: 'up' as const, latency_ms: Date.now() - start }
    } catch {
      return { status: 'down' as const, latency_ms: 0 }
    }
  },
}
