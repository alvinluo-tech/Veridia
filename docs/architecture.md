# Veridia — Architecture

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│                   UI Layer                   │
│  (React Components, Pages, Layouts)          │
├─────────────────────────────────────────────┤
│               Server Actions                 │
│  (app/actions/*.ts)                          │
├──────────────────────┬──────────────────────┤
│   Domain Services    │   Jarvis Adapter      │
│   (lib/domain/*.ts)  │   (api/jarvis/*.ts)   │
├──────────────────────┴──────────────────────┤
│              Supabase Client Layer           │
│  (lib/supabase/server.ts, client.ts)         │
├─────────────────────────────────────────────┤
│           Supabase Postgres + RLS            │
└─────────────────────────────────────────────┘
```

## Key Principles

1. **Domain services are the single source of truth** — all business logic lives in `lib/domain/`
2. **UI and Jarvis share domain services** — no duplicate logic
3. **RLS enforces data isolation** — user_id check on every table
4. **Server Components by default** — `'use client'` only for interactive UI
5. **Server Actions for mutations** — API routes only for Jarvis and metadata

## Directory Structure

```
veridia/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Landing / redirect
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── auth/
│   │       └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + top nav layout
│   │   ├── dashboard/page.tsx
│   │   ├── library/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── notes/page.tsx
│   │   ├── insights/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── integrations/page.tsx
│   ├── api/
│   │   ├── metadata/
│   │   │   ├── books/route.ts
│   │   │   ├── movies/route.ts
│   │   │   └── tv/route.ts
│   │   └── jarvis/
│   │       └── media/
│   │           ├── current/route.ts
│   │           ├── search/route.ts
│   │           ├── add/route.ts
│   │           ├── update-progress/route.ts
│   │           ├── update-status/route.ts
│   │           ├── add-note/route.ts
│   │           ├── stats/route.ts
│   │           └── recommend-next/route.ts
│   └── actions/
│       ├── auth.ts
│       ├── media.ts
│       ├── notes.ts
│       └── collections.ts
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   └── top-nav.tsx
│   ├── media/
│   │   ├── media-card.tsx
│   │   ├── media-grid.tsx
│   │   ├── media-list.tsx
│   │   ├── media-status-badge.tsx
│   │   ├── media-type-badge.tsx
│   │   ├── media-progress.tsx
│   │   ├── media-rating.tsx
│   │   ├── media-search-dialog.tsx
│   │   └── media-form.tsx
│   ├── notes/
│   │   ├── note-editor.tsx
│   │   ├── note-list.tsx
│   │   └── note-card.tsx
│   ├── collections/
│   │   ├── collection-card.tsx
│   │   └── collection-form.tsx
│   └── dashboard/
│       ├── stats-card.tsx
│       ├── continue-section.tsx
│       ├── weekly-summary-card.tsx
│       ├── stale-items-card.tsx
│       └── recent-notes-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client (cookies)
│   │   └── middleware.ts       # Auth middleware
│   ├── domain/
│   │   ├── media.ts            # Media CRUD + queries
│   │   ├── notes.ts            # Notes CRUD
│   │   ├── collections.ts      # Collections CRUD
│   │   ├── stats.ts            # Dashboard stats
│   │   ├── recommendations.ts  # Rule-based recs
│   │   └── activity.ts         # Activity logging
│   ├── metadata/
│   │   ├── openlibrary.ts
│   │   ├── google-books.ts
│   │   └── tmdb.ts
│   ├── jarvis/
│   │   ├── auth.ts             # Token verification
│   │   ├── permissions.ts      # Permission checks
│   │   └── schemas.ts          # Zod schemas
│   └── utils/
│       ├── date.ts
│       ├── progress.ts
│       └── format.ts
├── types/
│   ├── media.ts
│   └── jarvis.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts
├── .env.local
├── package.json
└── tsconfig.json
```

## Data Flow Patterns

### Server Component Data Fetching

```typescript
// app/(dashboard)/library/page.tsx
import { createClient } from '@/lib/supabase/server'
import { searchUserMedia } from '@/lib/domain/media'

export default async function LibraryPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const items = await searchUserMedia(supabase, user.id, {
    type: searchParams.type,
    status: searchParams.status,
    query: searchParams.q,
  })

  return <MediaGrid items={items} />
}
```

### Server Action Mutation

```typescript
// app/actions/media.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { updateMediaProgress } from '@/lib/domain/media'
import { revalidatePath } from 'next/cache'

export async function updateProgress(userMediaId: string, current: number, total?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await updateMediaProgress(supabase, user.id, userMediaId, { current, total })
  revalidatePath('/library')
}
```

### Jarvis API Route

```typescript
// app/api/jarvis/media/current/route.ts
import { verifyJarvisToken } from '@/lib/jarvis/auth'
import { getCurrentMedia } from '@/lib/domain/media'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const auth = await verifyJarvisToken(request)
  if (!auth.success) return Response.json({ error: auth.error }, { status: 401 })

  const supabase = createServiceClient()
  const items = await getCurrentMedia(supabase, auth.userId)
  return Response.json({ success: true, data: items })
}
```

## Security Model

| Layer | Mechanism |
|-------|-----------|
| Route protection | Next.js middleware checks auth |
| Data isolation | Supabase RLS on all user tables |
| API auth | Supabase session cookies for UI, Bearer token for Jarvis |
| Input validation | Zod schemas on all inputs |
| Secret management | .env.local, service role key server-only |
