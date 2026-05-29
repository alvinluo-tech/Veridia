import { isLocalMode } from '@/lib/db'
import { NextResponse } from 'next/server'

function sanitizeNext(next: string): string {
  if (!next.startsWith('/') || next.includes('://')) return '/dashboard'
  return next
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = sanitizeNext(searchParams.get('next') ?? '/dashboard')

  // Local mode: no email verification needed, redirect to dashboard
  if (isLocalMode()) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Supabase mode: handle OAuth/OIDC callback
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) return NextResponse.redirect(`${origin}${next}`)

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
