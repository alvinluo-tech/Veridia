'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Library,
  Bookmark,
  StickyNote,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/collections', label: 'Collections', icon: Bookmark },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-200 px-5">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <span className="text-lg font-semibold text-neutral-900">Veridia</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-200 p-4">
        <div className="text-xs text-neutral-400">Veridia v0.1.0</div>
      </div>
    </aside>
  )
}
