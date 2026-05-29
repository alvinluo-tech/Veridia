import { createClient } from '@/lib/supabase/server'
import type { AuthProvider, AuthUser } from './types'

export class SupabaseAuthProvider implements AuthProvider {
  async getUser(): Promise<AuthUser | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email!,
      user_metadata: user.user_metadata as AuthUser['user_metadata'],
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw new Error(error.message)

    return {
      id: data.user.id,
      email: data.user.email!,
      user_metadata: data.user.user_metadata as AuthUser['user_metadata'],
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    const supabase = await createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: siteUrl + '/auth/callback',
      },
    })

    if (error) throw new Error(error.message)

    return {
      id: data.user!.id,
      email: data.user!.email!,
      user_metadata: { display_name: displayName },
    }
  }

  async signOut(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
}
