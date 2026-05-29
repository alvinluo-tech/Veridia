import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopNav } from '@/components/layout/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AppSidebar />
      <div className="pl-60">
        <TopNav />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
