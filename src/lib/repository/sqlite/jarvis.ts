import { eq, and, desc } from 'drizzle-orm'
import { getSqliteDb } from '@/lib/db'
import { jarvisApiTokens, jarvisToolLogs } from '@/lib/db/schema'
import type { JarvisRepository } from '../types'

export class SqliteJarvisRepository implements JarvisRepository {
  async createToken(
    userId: string,
    data: { name: string; tokenHash: string; can_read?: boolean; can_write?: boolean; can_delete?: boolean }
  ): Promise<void> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(jarvisApiTokens).values({
      id,
      user_id: userId,
      name: data.name,
      token_hash: data.tokenHash,
      can_read: data.can_read ?? true,
      can_write: data.can_write ?? false,
      can_delete: data.can_delete ?? false,
      created_at: now,
    }).run()
  }

  async getTokens(userId: string) {
    const db = getSqliteDb()
    const rows = db.select({
      id: jarvisApiTokens.id,
      name: jarvisApiTokens.name,
      can_read: jarvisApiTokens.can_read,
      can_write: jarvisApiTokens.can_write,
      can_delete: jarvisApiTokens.can_delete,
      last_used_at: jarvisApiTokens.last_used_at,
      expires_at: jarvisApiTokens.expires_at,
      created_at: jarvisApiTokens.created_at,
    })
      .from(jarvisApiTokens)
      .where(eq(jarvisApiTokens.user_id, userId))
      .orderBy(desc(jarvisApiTokens.created_at))
      .all()

    return rows.map(r => ({
      ...r,
      can_read: Boolean(r.can_read),
      can_write: Boolean(r.can_write),
      can_delete: Boolean(r.can_delete),
    }))
  }

  async deleteToken(userId: string, tokenId: string): Promise<void> {
    const db = getSqliteDb()
    db.delete(jarvisApiTokens)
      .where(and(eq(jarvisApiTokens.id, tokenId), eq(jarvisApiTokens.user_id, userId)))
      .run()
  }

  async verifyToken(tokenHash: string) {
    const db = getSqliteDb()
    const row = db.select({
      user_id: jarvisApiTokens.user_id,
      can_read: jarvisApiTokens.can_read,
      can_write: jarvisApiTokens.can_write,
      can_delete: jarvisApiTokens.can_delete,
      expires_at: jarvisApiTokens.expires_at,
    })
      .from(jarvisApiTokens)
      .where(eq(jarvisApiTokens.token_hash, tokenHash))
      .get()

    if (!row) return null

    return {
      userId: row.user_id,
      permissions: {
        can_read: Boolean(row.can_read),
        can_write: Boolean(row.can_write),
        can_delete: Boolean(row.can_delete),
      },
      expires_at: row.expires_at,
    }
  }

  async updateTokenLastUsed(tokenHash: string): Promise<void> {
    const db = getSqliteDb()
    db.update(jarvisApiTokens)
      .set({ last_used_at: new Date().toISOString() })
      .where(eq(jarvisApiTokens.token_hash, tokenHash))
      .run()
  }

  async logToolCall(
    userId: string,
    toolName: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    status: 'success' | 'error' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const db = getSqliteDb()
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    db.insert(jarvisToolLogs).values({
      id,
      user_id: userId,
      tool_name: toolName,
      input: JSON.stringify(input),
      output: output ? JSON.stringify(output) : null,
      status,
      error_message: errorMessage,
      created_at: now,
    }).run()
  }

  async getToolLogs(userId: string, limit = 20) {
    const db = getSqliteDb()
    const rows = db.select()
      .from(jarvisToolLogs)
      .where(eq(jarvisToolLogs.user_id, userId))
      .orderBy(desc(jarvisToolLogs.created_at))
      .limit(limit)
      .all() as Record<string, unknown>[]

    return rows.map(r => ({
      id: r.id as string,
      user_id: r.user_id as string,
      tool_name: r.tool_name as string,
      input: r.input ? JSON.parse(r.input as string) : null,
      output: r.output ? JSON.parse(r.output as string) : null,
      status: r.status as string,
      error_message: r.error_message as string | null,
      created_at: r.created_at as string,
    }))
  }
}
