import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()

  const [stats, inProgress, stale, recent, activity, notes] = await Promise.all([
    repo.stats.getDashboardStats(user.id),
    repo.media.getCurrentMedia(user.id),
    repo.media.getStaleMedia(user.id),
    repo.media.getRecentlyAddedMedia(user.id, 5),
    repo.activity.getRecentActivity(user.id, 10),
    repo.notes.getRecentNotes(user.id, 5),
  ])

  return (
    <DashboardClient
      stats={stats}
      inProgress={inProgress}
      stale={stale}
      recent={recent}
      activity={activity}
      notes={notes}
    />
  )
}
