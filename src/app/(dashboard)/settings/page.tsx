import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) redirect('/login')

  const repo = await getRepository()

  const [tokens, logs] = await Promise.all([
    repo.jarvis.getTokens(user.id),
    repo.jarvis.getToolLogs(user.id, 20),
  ])

  return <SettingsClient user={user} tokens={tokens} logs={logs} />
}
