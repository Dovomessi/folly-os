// Supabase client configuration
// Note: Install @supabase/supabase-js to enable real Supabase integration

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zetdusjieqctrcsmimqr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5dCmB0Hy8PbRyiive2a_xQ_O4yss-_l'

// Placeholder for Supabase client - uncomment when @supabase/supabase-js is installed
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          project_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      appointments: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          project_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          project_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      passwords: {
        Row: {
          id: string
          name: string
          username: string
          password: string
          url: string | null
          notes: string | null
          project_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
    }
  }
}
