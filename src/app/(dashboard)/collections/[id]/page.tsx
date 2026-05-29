import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect, notFound } from 'next/navigation'
import { CollectionDetailClient } from './detail-client'

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()
  const { id } = await params
  const collection = await repo.collections.getCollectionById(user.id, id)

  if (!collection) notFound()

  return <CollectionDetailClient collection={collection} />
}
