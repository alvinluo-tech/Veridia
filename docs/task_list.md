# Veridia — Development Task List

## Phase 1: Project Initialization

- [ ] Initialize Next.js 16 project with TypeScript + Tailwind + App Router
- [ ] Install and configure shadcn/ui
- [ ] Install @supabase/supabase-js, @supabase/ssr
- [ ] Create .env.local with Supabase keys
- [ ] Create lib/supabase/client.ts (browser)
- [ ] Create lib/supabase/server.ts (server with cookies)
- [ ] Create middleware.ts for auth protection
- [ ] Create app/auth/callback/route.ts
- [ ] Create app/(auth)/login/page.tsx
- [ ] Create app/(auth)/register/page.tsx
- [ ] Create app/actions/auth.ts (signIn, signUp, signOut)
- [ ] Create app/(dashboard)/layout.tsx with sidebar + top nav
- [ ] Create components/layout/app-sidebar.tsx
- [ ] Create components/layout/top-nav.tsx
- [ ] Create app/(dashboard)/dashboard/page.tsx (placeholder)
- [ ] Create app/page.tsx (landing / redirect)
- [ ] Verify: user can register, login, see dashboard

## Phase 2: Database + Domain Services

- [ ] Create supabase/migrations/001_initial_schema.sql
  - [ ] Enum types (media_type, media_status, note_type)
  - [ ] media_items table
  - [ ] user_media_items table
  - [ ] media_notes table
  - [ ] collections table
  - [ ] collection_items table
  - [ ] activity_logs table
  - [ ] jarvis_tool_logs table
  - [ ] jarvis_api_tokens table
  - [ ] RLS policies on all tables
  - [ ] Indexes for common queries
- [ ] Create types/media.ts (TypeScript types)
- [ ] Create lib/domain/media.ts
  - [ ] searchUserMedia()
  - [ ] getUserMediaById()
  - [ ] addMediaToLibrary()
  - [ ] addManualMedia()
  - [ ] updateMediaStatus()
  - [ ] updateMediaProgress()
  - [ ] updateMediaRating()
  - [ ] updateMediaPriority()
  - [ ] toggleFavorite()
  - [ ] removeMediaFromLibrary()
  - [ ] getCurrentMedia()
  - [ ] getStaleMedia()
  - [ ] getRecentlyAddedMedia()
- [ ] Create lib/domain/notes.ts
  - [ ] addMediaNote()
  - [ ] updateMediaNote()
  - [ ] deleteMediaNote()
  - [ ] getNotesByUserMediaId()
  - [ ] getRecentNotes()
- [ ] Create lib/domain/collections.ts
  - [ ] createCollection()
  - [ ] updateCollection()
  - [ ] deleteCollection()
  - [ ] addMediaToCollection()
  - [ ] removeMediaFromCollection()
  - [ ] getCollections()
  - [ ] getCollectionById()
- [ ] Create lib/domain/stats.ts
  - [ ] getDashboardStats()
  - [ ] getWeeklyMediaStats()
  - [ ] getMediaTypeDistribution()
  - [ ] getTagDistribution()
- [ ] Create lib/domain/activity.ts
  - [ ] logActivity()
  - [ ] getRecentActivity()
- [ ] Create app/actions/media.ts (server actions)
- [ ] Create app/actions/notes.ts (server actions)
- [ ] Create app/actions/collections.ts (server actions)

## Phase 3: Library UI

- [ ] Create components/media/media-card.tsx
- [ ] Create components/media/media-grid.tsx
- [ ] Create components/media/media-list.tsx
- [ ] Create components/media/media-status-badge.tsx
- [ ] Create components/media/media-type-badge.tsx
- [ ] Create components/media/media-progress.tsx
- [ ] Create components/media/media-rating.tsx
- [ ] Create app/(dashboard)/library/page.tsx
  - [ ] Filter by type
  - [ ] Filter by status
  - [ ] Search by title
  - [ ] Sort options
  - [ ] Card/List view toggle
- [ ] Create app/(dashboard)/library/[id]/page.tsx
  - [ ] Detail header with cover, title, metadata
  - [ ] Status/progress/rating editors
  - [ ] Notes section
  - [ ] Activity log section
- [ ] Create components/media/media-form.tsx (manual add)

## Phase 4: External Metadata Search

- [ ] Create lib/metadata/openlibrary.ts
- [ ] Create lib/metadata/google-books.ts
- [ ] Create lib/metadata/tmdb.ts
- [ ] Create app/api/metadata/books/route.ts
- [ ] Create app/api/metadata/movies/route.ts
- [ ] Create app/api/metadata/tv/route.ts
- [ ] Create components/media/media-search-dialog.tsx
- [ ] Integrate search into library page

## Phase 5: Dashboard + Insights

- [ ] Create components/dashboard/stats-card.tsx
- [ ] Create components/dashboard/continue-section.tsx
- [ ] Create components/dashboard/weekly-summary-card.tsx
- [ ] Create components/dashboard/stale-items-card.tsx
- [ ] Create components/dashboard/recent-notes-card.tsx
- [ ] Implement app/(dashboard)/dashboard/page.tsx
- [ ] Create app/(dashboard)/insights/page.tsx
- [ ] Create app/(dashboard)/notes/page.tsx

## Phase 6: Collections

- [ ] Create components/collections/collection-card.tsx
- [ ] Create components/collections/collection-form.tsx
- [ ] Create app/(dashboard)/collections/page.tsx
- [ ] Create app/(dashboard)/collections/[id]/page.tsx
- [ ] Add "Add to Collection" flow in media detail

## Phase 7: Jarvis Adapter

- [ ] Create lib/jarvis/auth.ts (token verification)
- [ ] Create lib/jarvis/permissions.ts
- [ ] Create lib/jarvis/schemas.ts (Zod)
- [ ] Create app/api/jarvis/media/current/route.ts
- [ ] Create app/api/jarvis/media/search/route.ts
- [ ] Create app/api/jarvis/media/add/route.ts
- [ ] Create app/api/jarvis/media/update-progress/route.ts
- [ ] Create app/api/jarvis/media/update-status/route.ts
- [ ] Create app/api/jarvis/media/add-note/route.ts
- [ ] Create app/api/jarvis/media/stats/route.ts
- [ ] Create app/(dashboard)/settings/integrations/page.tsx

## Testing Checklist

- [ ] Auth: register, login, logout, protected routes
- [ ] Media: add, update status, update progress, rate, delete
- [ ] Library: filter, search, sort, view toggle
- [ ] Notes: add, edit, delete
- [ ] Collections: create, add media, remove media
- [ ] Dashboard: stats display, continue section, stale items
- [ ] Jarvis: token auth, CRUD operations, logging
