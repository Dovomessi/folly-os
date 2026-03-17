-- ============================================
-- Folly OS v3 — Native Schema Migration
-- ============================================

-- Task Columns (Kanban)
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  position INT NOT NULL DEFAULT 0,
  column_id UUID REFERENCES task_columns(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  labels TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#5E6AD2',
  type TEXT DEFAULT 'meeting' CHECK (type IN ('meeting', 'call', 'demo', 'personal', 'other')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Event Types (booking config)
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  duration_minutes INT NOT NULL DEFAULT 30,
  color TEXT DEFAULT '#5E6AD2',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  buffer_minutes INT DEFAULT 0,
  min_notice_hours INT DEFAULT 2,
  max_days_advance INT DEFAULT 30,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Availabilities
CREATE TABLE IF NOT EXISTS availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, day_of_week, start_time)
);

-- Blocked Dates
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  reason TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Booking Profile
CREATE TABLE IF NOT EXISTS booking_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  timezone TEXT DEFAULT 'Europe/Paris',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
);

-- Update Notes table (add new columns if not exist)
DO $$ BEGIN
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS content_html TEXT DEFAULT '';
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS template TEXT;
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS word_count INT DEFAULT 0;
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Sans titre',
    content TEXT DEFAULT '',
    content_html TEXT DEFAULT '',
    is_pinned BOOLEAN DEFAULT false,
    template TEXT,
    word_count INT DEFAULT 0,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
  );
END $$;

-- Vault Items
CREATE TABLE IF NOT EXISTS vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  username TEXT,
  encrypted_password TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'pro' CHECK (category IN ('pro', 'personal', 'api_keys', 'crypto', 'other')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_title TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- User can CRUD own data
CREATE POLICY "Users manage own task_columns" ON task_columns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own subtasks" ON subtasks FOR ALL USING (task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own task_comments" ON task_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own event_types" ON event_types FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own availabilities" ON availabilities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own blocked_dates" ON blocked_dates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own booking_profile" ON booking_profile FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own vault_items" ON vault_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own activity_log" ON activity_log FOR ALL USING (auth.uid() = user_id);

-- Public read for booking
CREATE POLICY "Public read event_types" ON event_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public read availabilities" ON availabilities FOR SELECT USING (true);
CREATE POLICY "Public read blocked_dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Public read booking_profile" ON booking_profile FOR SELECT USING (true);

-- Public insert for appointments (booking)
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_time ON appointments(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_user ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id, created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER vault_items_updated_at BEFORE UPDATE ON vault_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
