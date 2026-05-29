'use server'
import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { revalidatePath } from 'next/cache'
import type { MediaType, MediaStatus } from '@/types/media'

async function getAuthedUser() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const repo = await getRepository()
  return { user, repo }
}

export async function addManualMediaAction(data: {
  type: MediaType
  title: string
  original_title?: string
  description?: string
  cover_url?: string
  creators?: { name: string; role: string }[]
  genres?: string[]
  language?: string
  release_date?: string
  metadata?: Record<string, unknown>
  status?: MediaStatus
  priority?: number
}) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.addManualMedia(user.id, data)

  await repo.activity.logActivity(user.id, {
    action: 'media_added',
    user_media_id: item.id,
    new_value: { title: data.title, type: data.type },
  })

  revalidatePath('/library')
  revalidatePath('/dashboard')
  return item
}

export async function addFromSearchAction(
  searchResult: {
    source: string
    external_id: string
    title: string
    original_title?: string
    description?: string
    cover_url?: string
    creators?: { name: string; role: string }[]
    genres?: string[]
    language?: string
    release_date?: string
    metadata?: Record<string, unknown>
  },
  type: MediaType,
  userData?: { status?: MediaStatus; priority?: number; reason_to_consume?: string }
) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.addMediaToLibrary(user.id, {
    ...searchResult,
    type,
  }, userData)

  await repo.activity.logActivity(user.id, {
    action: 'media_added',
    user_media_id: item.id,
    new_value: { title: searchResult.title, type, source: searchResult.source },
  })

  revalidatePath('/library')
  revalidatePath('/dashboard')
  return item
}

export async function updateMediaStatusAction(userMediaId: string, status: MediaStatus) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.updateMediaStatus(user.id, userMediaId, status)

  await repo.activity.logActivity(user.id, {
    action: 'status_updated',
    user_media_id: userMediaId,
    new_value: { status },
  })

  revalidatePath('/library')
  revalidatePath('/dashboard')
  revalidatePath(`/library/${userMediaId}`)
  return item
}

export async function updateMediaProgressAction(
  userMediaId: string,
  progress: { current: number; total?: number; unit?: string }
) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.updateMediaProgress(user.id, userMediaId, progress)

  await repo.activity.logActivity(user.id, {
    action: 'progress_updated',
    user_media_id: userMediaId,
    new_value: { progress_current: progress.current, progress_total: progress.total },
  })

  revalidatePath('/library')
  revalidatePath(`/library/${userMediaId}`)
  return item
}

export async function updateMediaRatingAction(userMediaId: string, rating: number | null) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.updateMediaRating(user.id, userMediaId, rating)

  await repo.activity.logActivity(user.id, {
    action: 'rating_updated',
    user_media_id: userMediaId,
    new_value: { rating },
  })

  revalidatePath('/library')
  revalidatePath(`/library/${userMediaId}`)
  return item
}

export async function toggleFavoriteAction(userMediaId: string) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.media.toggleFavorite(user.id, userMediaId)

  revalidatePath('/library')
  revalidatePath(`/library/${userMediaId}`)
  return item
}

export async function removeMediaFromLibraryAction(userMediaId: string) {
  const { user, repo } = await getAuthedUser()
  await repo.media.removeMediaFromLibrary(user.id, userMediaId)

  await repo.activity.logActivity(user.id, {
    action: 'media_removed',
    user_media_id: userMediaId,
  })

  revalidatePath('/library')
  revalidatePath('/dashboard')
}
