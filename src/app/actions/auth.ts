'use server'
import { getAuth } from '@/lib/auth'
import { isLocalMode } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData) {
  const auth = getAuth()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await auth.signIn(email, password)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Sign in failed' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const auth = getAuth()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  try {
    await auth.signUp(email, password, name)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Sign up failed' }
  }

  if (isLocalMode()) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  return { success: 'Check your email to confirm your account.' }
}

export async function signOut() {
  const auth = getAuth()
  await auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
