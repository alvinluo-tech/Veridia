'use server'
import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { revalidatePath } from 'next/cache'

async function getAuthedUser() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const repo = await getRepository()
  return { user, repo }
}

export async function createCollectionAction(data: {
  name: string
  description?: string
  icon?: string
  color?: string
}) {
  const { user, repo } = await getAuthedUser()
  const collection = await repo.collections.createCollection(user.id, data)

  await repo.activity.logActivity(user.id, {
    action: 'collection_created',
    new_value: { name: data.name },
  })

  revalidatePath('/collections')
  return collection
}

export async function updateCollectionAction(
  collectionId: string,
  data: { name?: string; description?: string; icon?: string; color?: string }
) {
  const { user, repo } = await getAuthedUser()
  const collection = await repo.collections.updateCollection(user.id, collectionId, data)

  revalidatePath('/collections')
  revalidatePath(`/collections/${collectionId}`)
  return collection
}

export async function deleteCollectionAction(collectionId: string) {
  const { user, repo } = await getAuthedUser()
  await repo.collections.deleteCollection(user.id, collectionId)

  revalidatePath('/collections')
}

export async function addToCollectionAction(collectionId: string, userMediaId: string) {
  const { user, repo } = await getAuthedUser()
  const item = await repo.collections.addMediaToCollection(user.id, collectionId, userMediaId)

  await repo.activity.logActivity(user.id, {
    action: 'collection_item_added',
    user_media_id: userMediaId,
    new_value: { collection_id: collectionId },
  })

  revalidatePath(`/collections/${collectionId}`)
  revalidatePath(`/library/${userMediaId}`)
  return item
}

export async function removeFromCollectionAction(collectionId: string, userMediaId: string) {
  const { user, repo } = await getAuthedUser()
  await repo.collections.removeMediaFromCollection(user.id, collectionId, userMediaId)

  await repo.activity.logActivity(user.id, {
    action: 'collection_item_removed',
    user_media_id: userMediaId,
    old_value: { collection_id: collectionId },
  })

  revalidatePath(`/collections/${collectionId}`)
  revalidatePath(`/library/${userMediaId}`)
}
