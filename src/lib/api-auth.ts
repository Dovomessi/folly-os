import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Verify an API key and return the associated user_id.
 * Returns null if the key is invalid or revoked.
 */
export async function verifyApiKey(key: string): Promise<string | null> {
  const hash = hashKey(key)
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .single()

  if (error || !data) return null

  // Update last_used_at (fire and forget)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then()

  return data.user_id
}

/**
 * Generate a new API key. Returns the raw key (only shown once) and metadata.
 */
export async function generateApiKey(userId: string, name: string) {
  const supabase = getAdminClient()

  // Generate a random key: fos_<40 hex chars>
  const randomBytes = await import('crypto').then(c => c.randomBytes(20).toString('hex'))
  const rawKey = `fos_${randomBytes}`
  const keyHash = hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 8)

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      user_id: userId,
    })
    .select('id, name, key_prefix, created_at')
    .single()

  if (error) throw error

  return { ...data, key: rawKey }
}

/**
 * List all API keys for a user (without the actual key).
 */
export async function listApiKeys(userId: string) {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, created_at, revoked_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Revoke an API key.
 */
export async function revokeApiKey(userId: string, keyId: string) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', userId)

  if (error) throw error
}
