import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect, notFound } from 'next/navigation'
import { DetailPageClient } from './detail-client'

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()
  const { id } = await params

  const item = await repo.media.getUserMediaById(user.id, id)
  if (!item) notFound()

  const [notes, activity, collections, collectionIds] = await Promise.all([
    repo.notes.getNotesByUserMediaId(user.id, id),
    repo.activity.getRecentActivity(user.id, 10),
    repo.collections.getCollections(user.id),
    repo.collections.getCollectionIdsForMedia(user.id, id),
  ])

  return (
    <DetailPageClient
      item={item}
      notes={notes}
      activity={activity}
      collections={collections}
      collectionIds={collectionIds}
    />
  )
}
