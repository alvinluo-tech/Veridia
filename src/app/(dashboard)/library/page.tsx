import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { LibraryPageClient } from './library-client'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()
  const params = await searchParams
  const type = typeof params.type === 'string' ? params.type : undefined
  const status = typeof params.status === 'string' ? params.status : undefined
  const q = typeof params.q === 'string' ? params.q : undefined
  const view = typeof params.view === 'string' ? params.view : 'grid'

  const items = await repo.media.searchUserMedia(user.id, {
    type: type as any,
    status: status as any,
    query: q,
    limit: 100,
  })

  return (
    <LibraryPageClient
      initialItems={items}
      initialType={type}
      initialStatus={status}
      initialQuery={q}
      initialView={view as 'grid' | 'list'}
    />
  )
}
