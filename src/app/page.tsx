import { getAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const auth = getAuth()
  const user = await auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Veridia</h1>
        <p className="text-lg text-neutral-500 max-w-md">
          A personal media and knowledge library for collecting, tracking, and rediscovering everything you read, watch, and learn.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
