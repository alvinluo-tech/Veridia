import { NextRequest, NextResponse } from 'next/server'
import { isLocalMode } from '@/lib/db'
import { verifyJarvisToken, checkPermission } from '@/lib/jarvis/auth'
import { getRepository } from '@/lib/repository'
import { createHash } from 'crypto'
import type { MediaType, MediaStatus, NoteType } from '@/types/media'

function success<T>(data: T) {
  return NextResponse.json({ success: true, data })
}

function error(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

async function verifyTokenLocal(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  if (!token) return null

  const repo = await getRepository()
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const result = await repo.jarvis.verifyToken(tokenHash)
  if (!result) return null

  // Check expiration
  if (result.expires_at && new Date(result.expires_at) < new Date()) {
    return null
  }

  // Update last_used_at (fire and forget)
  repo.jarvis.updateTokenLastUsed(tokenHash).catch(() => {})

  return {
    userId: result.userId,
    permissions: result.permissions,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params

  const auth = isLocalMode()
    ? await verifyTokenLocal(request.headers.get('Authorization'))
    : await verifyJarvisToken(request.headers.get('Authorization'))

  if (!auth) {
    return error('UNAUTHORIZED', 'Invalid or expired token', 401)
  }

  if (!checkPermission(auth, 'read')) {
    return error('FORBIDDEN', 'Token does not have read permission', 403)
  }

  const repo = await getRepository()
  const searchParams = request.nextUrl.searchParams

  try {
    switch (tool) {
      case 'current': {
        const type = searchParams.get('type') as MediaType | null
        const items = await repo.media.getCurrentMedia(auth.userId, type ?? undefined)
        await repo.jarvis.logToolCall(auth.userId, 'get_current_media', { type }, { count: items.length })
        return success(items)
      }

      case 'stats': {
        const range = searchParams.get('range') ?? 'month'
        const stats = await repo.stats.getDashboardStats(auth.userId)
        await repo.jarvis.logToolCall(auth.userId, 'get_media_stats', { range }, stats as unknown as Record<string, unknown>)
        return success(stats)
      }

      default:
        return error('NOT_FOUND', `Unknown tool: ${tool}`, 404)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    await repo.jarvis.logToolCall(auth.userId, tool, {}, null, 'error', message)
    return error('INTERNAL_ERROR', message, 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params

  const auth = isLocalMode()
    ? await verifyTokenLocal(request.headers.get('Authorization'))
    : await verifyJarvisToken(request.headers.get('Authorization'))

  if (!auth) {
    return error('UNAUTHORIZED', 'Invalid or expired token', 401)
  }

  if (!checkPermission(auth, 'write')) {
    return error('FORBIDDEN', 'Token does not have write permission', 403)
  }

  const repo = await getRepository()

  try {
    const body = await request.json()

    switch (tool) {
      case 'add': {
        const { type, title, status, reason_to_consume, priority } = body
        if (!type || !title) {
          return error('VALIDATION_ERROR', 'type and title are required')
        }

        const item = await repo.media.addMediaToLibrary(
          auth.userId,
          { type, title },
          { status, reason_to_consume, priority }
        )
        await repo.jarvis.logToolCall(auth.userId, 'add_media', body, { id: item.id })
        return success(item)
      }

      case 'progress': {
        const { user_media_id, title, progress_current, progress_total, progress_unit } = body
        if ((!user_media_id && !title) || progress_current === undefined) {
          return error('VALIDATION_ERROR', 'user_media_id (or title) and progress_current are required')
        }

        let mediaId = user_media_id
        if (!mediaId && title) {
          const found = await repo.media.findUserMediaByTitle(auth.userId, title)
          if (found.length === 0) return error('NOT_FOUND', `Media not found: ${title}`, 404)
          mediaId = found[0].id
        }

        const item = await repo.media.updateMediaProgress(auth.userId, mediaId, {
          current: progress_current,
          total: progress_total,
          unit: progress_unit,
        })
        await repo.jarvis.logToolCall(auth.userId, 'update_progress', body, { id: item.id })
        return success(item)
      }

      case 'status': {
        const { user_media_id, title, status } = body
        if ((!user_media_id && !title) || !status) {
          return error('VALIDATION_ERROR', 'user_media_id (or title) and status are required')
        }

        let mediaId = user_media_id
        if (!mediaId && title) {
          const found = await repo.media.findUserMediaByTitle(auth.userId, title)
          if (found.length === 0) return error('NOT_FOUND', `Media not found: ${title}`, 404)
          mediaId = found[0].id
        }

        const item = await repo.media.updateMediaStatus(auth.userId, mediaId, status)
        await repo.jarvis.logToolCall(auth.userId, 'update_status', body, { id: item.id })
        return success(item)
      }

      case 'note': {
        const { user_media_id, title, type, content, page_number, timestamp_seconds, season_number, episode_number } = body
        if ((!user_media_id && !title) || !content) {
          return error('VALIDATION_ERROR', 'user_media_id (or title) and content are required')
        }

        let mediaId = user_media_id
        if (!mediaId && title) {
          const found = await repo.media.findUserMediaByTitle(auth.userId, title)
          if (found.length === 0) return error('NOT_FOUND', `Media not found: ${title}`, 404)
          mediaId = found[0].id
        }

        const note = await repo.notes.addMediaNote(auth.userId, {
          user_media_id: mediaId,
          type: type as NoteType,
          content,
          page_number,
          timestamp_seconds,
          season_number,
          episode_number,
        })
        await repo.jarvis.logToolCall(auth.userId, 'add_note', body, { id: note.id })
        return success(note)
      }

      default:
        return error('NOT_FOUND', `Unknown tool: ${tool}`, 404)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    await repo.jarvis.logToolCall(auth.userId, tool, {}, null, 'error', message)
    return error('INTERNAL_ERROR', message, 500)
  }
}
