import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { NotesClient } from './notes-client'
import type { NoteType } from '@/types/media'

const noteTypes: NoteType[] = ['note', 'quote', 'review', 'reflection', 'summary']

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()
  const params = await searchParams
  const typeFilter = typeof params.type === 'string' ? params.type : undefined

  const notes = typeFilter && noteTypes.includes(typeFilter as NoteType)
    ? await repo.notes.getNotesByType(user.id, typeFilter as NoteType)
    : await repo.notes.getRecentNotes(user.id, 100)

  const mediaIds = [...new Set(notes.map((n) => n.user_media_id))]
  const mediaTitles = await repo.collections.getMediaTitlesByIds(user.id, mediaIds)

  return (
    <NotesClient
      notes={notes}
      mediaTitles={mediaTitles}
      activeType={typeFilter}
    />
  )
}
