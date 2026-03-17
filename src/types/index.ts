// ============================================
// PROJETS
// ============================================
export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  status: 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
  user_id?: string
}

// ============================================
// TACHES
// ============================================
export interface TaskColumn {
  id: string
  name: string
  position: number
  status?: string
  project_id: string
  user_id: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  position: number
  column_id: string | null
  due_date: string | null
  labels: string[]
  project_id: string
  created_at: string
  updated_at: string
  user_id: string
  subtasks?: Subtask[]
  comments?: TaskComment[]
}

export interface Subtask {
  id: string
  title: string
  is_completed: boolean
  position: number
  task_id: string
}

export interface TaskComment {
  id: string
  content: string
  task_id: string
  created_at: string
  user_id: string
}

// ============================================
// CALENDRIER / RDV
// ============================================
export interface Appointment {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  color: string
  type: 'meeting' | 'call' | 'demo' | 'personal' | 'other'
  status: 'confirmed' | 'pending' | 'cancelled'
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  project_id: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// ============================================
// BOOKING PUBLIC
// ============================================
export interface EventType {
  id: string
  name: string
  slug: string
  duration_minutes: number
  color: string
  description: string | null
  is_active: boolean
  buffer_minutes: number
  min_notice_hours: number
  max_days_advance: number
  user_id: string
  created_at: string
}

export interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  user_id: string
}

export interface BlockedDate {
  id: string
  date: string
  reason: string | null
  user_id: string
}

export interface BookingProfile {
  id: string
  display_name: string
  slug: string
  bio: string | null
  timezone: string
  user_id: string
}

// ============================================
// NOTES
// ============================================
export interface Note {
  id: string
  title: string
  content: string
  content_html: string
  is_pinned: boolean
  template: string | null
  word_count: number
  project_id: string
  created_at: string
  updated_at: string
  user_id: string
}

// ============================================
// COFFRE-FORT
// ============================================
export interface VaultItem {
  id: string
  name: string
  url: string | null
  username: string | null
  encrypted_password: string
  notes: string | null
  category: 'pro' | 'personal' | 'api_keys' | 'crypto' | 'other'
  project_id: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// ============================================
// ACTIVITE
// ============================================
export interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  entity_title: string | null
  project_id: string | null
  created_at: string
  user_id: string
}

// ============================================
// API
// ============================================
export interface ApiResponse<T> {
  data?: T
  error?: string
}

// ============================================
// UI
// ============================================
export interface StatCard {
  label: string
  value: number
  sub: string
}

export interface WidgetItem {
  id: string
  title: string
  subtitle: string
  timestamp?: string
  meta?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: string
}

export type CalendarView = 'month' | 'week' | 'day'
export type TaskView = 'kanban' | 'list'
