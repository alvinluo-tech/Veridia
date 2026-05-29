import { getIronSession, type IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
}

const SESSION_PASSWORD = process.env.IRON_SESSION_PASSWORD || 'veridia-dev-only-password-change-in-production-32chars!'

export const sessionOptions = {
  cookieName: 'veridia_session',
  password: SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
