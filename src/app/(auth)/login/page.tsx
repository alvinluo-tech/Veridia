'use client'
import { useState } from 'react'
import { signIn } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to your Veridia library</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
