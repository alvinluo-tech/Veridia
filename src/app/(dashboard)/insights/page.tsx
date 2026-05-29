import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { InsightsClient } from './insights-client'

export default async function InsightsPage() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()

  const [stats, typeDistribution, tagDistribution, completionRate] = await Promise.all([
    repo.stats.getDashboardStats(user.id),
    repo.stats.getMediaTypeDistribution(user.id),
    repo.stats.getTagDistribution(user.id),
    repo.stats.getCompletionRate(user.id),
  ])

  return (
    <InsightsClient
      stats={stats}
      typeDistribution={typeDistribution}
      tagDistribution={tagDistribution}
      completionRate={completionRate}
    />
  )
}
