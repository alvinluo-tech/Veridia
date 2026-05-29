'use server'
import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { revalidatePath } from 'next/cache'
import type { NoteType } from '@/types/media'

async function getAuthedUser() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const repo = await getRepository()
  return { user, repo }
}

export async function addNoteAction(data: {
  user_media_id: string
  type?: NoteType
  content: string
  location_label?: string
  page_number?: number
  timestamp_seconds?: number
  season_number?: number
  episode_number?: number
}) {
  const { user, repo } = await getAuthedUser()
  const note = await repo.notes.addMediaNote(user.id, data)

  await repo.activity.logActivity(user.id, {
    action: 'note_added',
    user_media_id: data.user_media_id,
    new_value: { type: data.type ?? 'note', content: data.content.slice(0, 100) },
  })

  revalidatePath(`/library/${data.user_media_id}`)
  revalidatePath('/notes')
  revalidatePath('/dashboard')
  return note
}

export async function updateNoteAction(
  noteId: string,
  data: {
    content?: string
    type?: NoteType
  }
) {
  const { user, repo } = await getAuthedUser()
  const note = await repo.notes.updateMediaNote(user.id, noteId, data)

  revalidatePath('/notes')
  return note
}

export async function deleteNoteAction(noteId: string, userMediaId: string) {
  const { user, repo } = await getAuthedUser()
  await repo.notes.deleteMediaNote(user.id, noteId)

  revalidatePath(`/library/${userMediaId}`)
  revalidatePath('/notes')
  revalidatePath('/dashboard')
}
