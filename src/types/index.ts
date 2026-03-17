export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  status: 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProjectServiceMapping {
  id: string
  project_id: string
  service: 'plane' | 'calcom' | 'docmost' | 'vaultwarden'
  external_id: string
  external_slug: string | null
}

export interface ServiceConfig {
  name: string
  label: string
  baseUrl: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface HealthStatus {
  service: string
  status: 'up' | 'down'
  latency_ms: number
}

export interface StatCard {
  label: string
  value: number
  sub: string
}

export interface WidgetItem {
  id: string
  title: string
  meta: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: string
}
