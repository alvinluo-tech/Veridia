import type { SupabaseClient } from '@supabase/supabase-js'
import type { JarvisRepository } from '../types'

export class SupabaseJarvisRepository implements JarvisRepository {
  constructor(private supabase: SupabaseClient) {}

  async createToken(
    userId: string,
    data: { name: string; tokenHash: string; can_read?: boolean; can_write?: boolean; can_delete?: boolean }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('jarvis_api_tokens')
      .insert({
        user_id: userId,
        name: data.name,
        token_hash: data.tokenHash,
        can_read: data.can_read ?? true,
        can_write: data.can_write ?? false,
        can_delete: data.can_delete ?? false,
      })

    if (error) throw error
  }

  async getTokens(userId: string) {
    const { data, error } = await this.supabase
      .from('jarvis_api_tokens')
      .select('id, name, can_read, can_write, can_delete, last_used_at, expires_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async deleteToken(userId: string, tokenId: string): Promise<void> {
    const { error } = await this.supabase
      .from('jarvis_api_tokens')
      .delete()
      .eq('id', tokenId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async verifyToken(tokenHash: string) {
    const { data, error } = await this.supabase
      .from('jarvis_api_tokens')
      .select('user_id, can_read, can_write, can_delete, expires_at')
      .eq('token_hash', tokenHash)
      .single()

    if (error || !data) return null

    return {
      userId: data.user_id,
      permissions: {
        can_read: data.can_read,
        can_write: data.can_write,
        can_delete: data.can_delete,
      },
      expires_at: data.expires_at,
    }
  }

  async updateTokenLastUsed(tokenHash: string): Promise<void> {
    await this.supabase
      .from('jarvis_api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash)
  }

  async logToolCall(
    userId: string,
    toolName: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    status: 'success' | 'error' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.supabase.from('jarvis_tool_logs').insert({
      user_id: userId,
      tool_name: toolName,
      input,
      output,
      status,
      error_message: errorMessage,
    })
  }

  async getToolLogs(userId: string, limit = 20) {
    const { data, error } = await this.supabase
      .from('jarvis_tool_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}
