import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { CollectionsClient } from './collections-client'

export default async function CollectionsPage() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()
  const collections = await repo.collections.getCollections(user.id)

  return <CollectionsClient collections={collections} />
}
