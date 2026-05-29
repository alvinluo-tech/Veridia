import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface JarvisAuthResult {
  userId: string
  permissions: {
    can_read: boolean
    can_write: boolean
    can_delete: boolean
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function verifyJarvisToken(
  authHeader: string | null
): Promise<JarvisAuthResult | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  if (!token) return null

  const supabase = createServiceClient()
  const tokenHash = hashToken(token)

  const { data, error } = await supabase
    .from('jarvis_api_tokens')
    .select('user_id, can_read, can_write, can_delete, expires_at')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !data) return null

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  // Update last_used_at (fire and forget)
  supabase
    .from('jarvis_api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .then(() => {})

  return {
    userId: data.user_id,
    permissions: {
      can_read: data.can_read,
      can_write: data.can_write,
      can_delete: data.can_delete,
    },
  }
}

export function checkPermission(
  auth: JarvisAuthResult,
  required: 'read' | 'write' | 'delete'
): boolean {
  switch (required) {
    case 'read':
      return auth.permissions.can_read
    case 'write':
      return auth.permissions.can_write
    case 'delete':
      return auth.permissions.can_delete
  }
}

export function generateToken(): string {
  const { randomBytes } = require('crypto')
  return 'vr_' + randomBytes(32).toString('base64url')
}
