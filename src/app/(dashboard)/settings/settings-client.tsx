'use client'
import { useState } from 'react'
import type { AuthUser } from '@/lib/auth/types'
import { createTokenAction, deleteTokenAction } from '@/app/actions/jarvis'
import { timeAgo } from '@/lib/utils/time'
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Clock, Shield } from 'lucide-react'

interface Token {
  id: string
  name: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

interface ToolLog {
  id: string
  tool_name: string
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  status: string
  error_message: string | null
  created_at: string
}

interface SettingsClientProps {
  user: AuthUser
  tokens: Token[]
  logs: ToolLog[]
}

export function SettingsClient({ user, tokens: initialTokens, logs }: SettingsClientProps) {
  const [tokens, setTokens] = useState(initialTokens)
  const [showCreate, setShowCreate] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [canRead, setCanRead] = useState(true)
  const [canWrite, setCanWrite] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!tokenName.trim()) return

    setCreating(true)
    setError(null)
    try {
      const result = await createTokenAction({
        name: tokenName.trim(),
        can_read: canRead,
        can_write: canWrite,
        can_delete: canDelete,
      })
      setNewToken(result.token)
      setTokenName('')
      setShowCreate(false)
      // Refresh tokens list
      const { getTokensAction } = await import('@/app/actions/jarvis')
      const updated = await getTokensAction()
      setTokens(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this token? Any Jarvis integrations using it will stop working.')) return

    try {
      await deleteTokenAction(id)
      setTokens(tokens.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete token')
    }
  }

  const handleCopy = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your account and integrations</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Account info */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-medium text-neutral-900">Account</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Email:</span>
            <span className="text-neutral-900">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">User ID:</span>
            <span className="font-mono text-xs text-neutral-600">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Jarvis Integration */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-neutral-900">Jarvis API Tokens</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Create tokens for Jarvis to read and update your library via API.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Token
          </button>
        </div>

        {/* New token display */}
        {newToken && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Token created! Copy it now — it won&apos;t be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 text-xs font-mono text-neutral-700 border border-green-200 break-all">
                {newToken}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setNewToken(null)}
              className="mt-2 text-xs text-green-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Token Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g., Jarvis Desktop"
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Permissions</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canRead}
                  onChange={(e) => setCanRead(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-600">Read (view library, stats)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canWrite}
                  onChange={(e) => setCanWrite(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-600">Write (add items, update progress, add notes)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canDelete}
                  onChange={(e) => setCanDelete(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-600">Delete (remove items)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !tokenName.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Token list */}
        <div className="mt-4 space-y-2">
          {tokens.length === 0 && !showCreate ? (
            <p className="text-sm text-neutral-400 py-4">No tokens created yet.</p>
          ) : (
            tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{token.name}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>Created {timeAgo(token.created_at)}</span>
                      {token.last_used_at && (
                        <span>Used {timeAgo(token.last_used_at)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {token.can_read && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">read</span>
                    )}
                    {token.can_write && (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600">write</span>
                    )}
                    {token.can_delete && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">delete</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(token.id)}
                    className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tool Logs */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-neutral-400" />
          <h2 className="text-lg font-medium text-neutral-900">Recent API Calls</h2>
        </div>

        {logs.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4">No API calls yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-neutral-100 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      log.status === 'success'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{log.tool_name}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{timeAgo(log.created_at)}</span>
                </div>
                {log.error_message && (
                  <p className="mt-1 text-xs text-red-500">{log.error_message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
