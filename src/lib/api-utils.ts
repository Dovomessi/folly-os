import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { verifyApiKey } from '@/lib/api-auth'

/**
 * Get the authenticated user from either:
 * 1. Supabase session cookie (frontend)
 * 2. API key in Authorization header (agents)
 *
 * Returns { userId, supabase } or null if not authenticated.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  // API key auth
  if (authHeader?.startsWith('Bearer fos_')) {
    const key = authHeader.slice(7)
    const userId = await verifyApiKey(key)
    if (!userId) return null

    // Use service role client scoped to this user's data via RLS bypass
    const supabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    return { userId, supabase }
  }

  // Cookie-based auth (frontend)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return { userId: user.id, supabase }
}
