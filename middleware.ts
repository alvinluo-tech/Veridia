import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/library', '/notes', '/insights', '/collections', '/settings']

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(p => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Local mode: check for session cookie existence
  if (!supabaseUrl || !supabaseKey) {
    const cookie = request.cookies.get('veridia_session')?.value
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Cookie exists — let the request through. Server actions/pages validate the session.
    return NextResponse.next()
  }

  // Supabase mode: verify session via Supabase
  const { createServerClient } = await import('@supabase/ssr')
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/jarvis).*)'],
}
