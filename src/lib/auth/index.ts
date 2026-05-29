import { isLocalMode } from '@/lib/db'
import { LocalAuthProvider } from './local'
import { SupabaseAuthProvider } from './supabase'
import type { AuthProvider } from './types'

let auth: AuthProvider | null = null

export function getAuth(): AuthProvider {
  if (auth) return auth

  auth = isLocalMode() ? new LocalAuthProvider() : new SupabaseAuthProvider()
  return auth
}
