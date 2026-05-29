import { getAuth } from '@/lib/auth'
import { signOut } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export async function TopNav() {
  const auth = getAuth()
  const user = await auth.getUser()

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div className="text-sm text-neutral-500">
        {user?.email}
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </header>
  )
}
