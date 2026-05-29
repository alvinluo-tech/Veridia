import type { SupabaseClient } from '@supabase/supabase-js'
import type { Collection, CollectionItem, UserMediaItem } from '@/types/media'

export async function createCollection(
  supabase: SupabaseClient,
  userId: string,
  data: {
    name: string
    description?: string
    icon?: string
    color?: string
  }
): Promise<Collection> {
  const { data: collection, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
    })
    .select()
    .single()

  if (error) throw error
  return collection as Collection
}

export async function updateCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  data: {
    name?: string
    description?: string
    icon?: string
    color?: string
  }
): Promise<Collection> {
  const { data: collection, error } = await supabase
    .from('collections')
    .update(data)
    .eq('id', collectionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return collection as Collection
}

export async function deleteCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string
): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getCollections(
  supabase: SupabaseClient,
  userId: string
): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Collection[]
}

export async function getCollectionById(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string
): Promise<(Collection & { items?: UserMediaItem[] }) | null> {
  const { data: collection, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get items in this collection
  const { data: items } = await supabase
    .from('collection_items')
    .select('user_media:user_media_items(*, media:media_items(*))')
    .eq('collection_id', collectionId)
    .order('position')

  return {
    ...(collection as Collection),
    items: (items as unknown as { user_media: UserMediaItem }[] | null)?.map(i => i.user_media) ?? [],
  }
}

export async function addMediaToCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  userMediaId: string
): Promise<CollectionItem> {
  // Verify collection ownership
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single()

  if (!collection) throw new Error('Collection not found')

  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      user_media_id: userMediaId,
    })
    .select()
    .single()

  if (error) throw error
  return data as CollectionItem
}

export async function removeMediaFromCollection(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  userMediaId: string
): Promise<void> {
  // Verify collection ownership
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single()

  if (!collection) throw new Error('Collection not found')

  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('user_media_id', userMediaId)

  if (error) throw error
}
