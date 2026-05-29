'use server'
import { getAuth } from '@/lib/auth'
import { getRepository } from '@/lib/repository'
import { generateToken } from '@/lib/jarvis/auth'
import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

async function getAuthedUser() {
  const auth = getAuth()
  const user = await auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const repo = await getRepository()
  return { user, repo }
}

export async function createTokenAction(data: {
  name: string
  can_read?: boolean
  can_write?: boolean
  can_delete?: boolean
}) {
  const { user, repo } = await getAuthedUser()
  const token = generateToken()
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await repo.jarvis.createToken(user.id, {
    name: data.name,
    tokenHash,
    can_read: data.can_read ?? true,
    can_write: data.can_write ?? false,
    can_delete: data.can_delete ?? false,
  })

  revalidatePath('/settings')
  return { token }
}

export async function getTokensAction() {
  const { user, repo } = await getAuthedUser()
  return repo.jarvis.getTokens(user.id)
}

export async function deleteTokenAction(tokenId: string) {
  const { user, repo } = await getAuthedUser()
  await repo.jarvis.deleteToken(user.id, tokenId)
  revalidatePath('/settings')
}

export async function getToolLogsAction(limit = 20) {
  const { user, repo } = await getAuthedUser()
  return repo.jarvis.getToolLogs(user.id, limit)
}
