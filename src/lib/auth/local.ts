import { hash, compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getSession } from './session'
import type { AuthProvider, AuthUser } from './types'

export class LocalAuthProvider implements AuthProvider {
  async getUser(): Promise<AuthUser | null> {
    const session = await getSession()
    if (!session.userId) return null

    const db = getSqliteDb()
    const user = db.select().from(users).where(eq(users.id, session.userId)).get()

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      user_metadata: { display_name: user.display_name ?? undefined },
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const db = getSqliteDb()
    const user = db.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const valid = await compare(password, user.password_hash)
    if (!valid) {
      throw new Error('Invalid email or password')
    }

    const session = await getSession()
    session.userId = user.id
    await session.save()

    return {
      id: user.id,
      email: user.email,
      user_metadata: { display_name: user.display_name ?? undefined },
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    const db = getSqliteDb()

    // Check if user already exists
    const existing = db.select().from(users).where(eq(users.email, email)).get()
    if (existing) {
      throw new Error('An account with this email already exists')
    }

    const passwordHash = await hash(password, 12)
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(users).values({
      id,
      email,
      display_name: displayName,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    }).run()

    const session = await getSession()
    session.userId = id
    await session.save()

    return {
      id,
      email,
      user_metadata: { display_name: displayName },
    }
  }

  async signOut(): Promise<void> {
    const session = await getSession()
    session.destroy()
  }
}
