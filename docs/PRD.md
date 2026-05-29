# Veridia — Product Requirements Document

## Overview

Veridia is a personal media and knowledge input management platform for collecting, tracking, reflecting on, and rediscovering everything you read, watch, and learn.

## Target User

Single user (personal use). No multi-user, no social features in MVP.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres, RLS enabled |
| Deployment | Vercel + Supabase Cloud |

## MVP Scope (Phases 1–6)

### In Scope

- Email/password auth with Supabase
- Dashboard with stats, continue section, stale items, recent notes
- Library page with card/list views, filtering, search, sorting
- Media detail page with notes, activity log, progress tracking
- Manual media addition
- External metadata search (Open Library, Google Books, TMDB)
- Status management (planned → in_progress → completed/paused/dropped/archived)
- Progress management (page/minute/episode)
- Rating (0.5–5, half-star)
- Notes (note, quote, review, reflection, summary)
- Collections (thematic folders)
- Basic stats and insights
- Jarvis API adapter (read + write)

### Out of Scope (MVP)

- Social features, sharing, comments
- AI summarization or recommendations
- Voice integration
- Mobile app
- Browser extension
- Article, Course, Podcast, Paper types (schema supports, UI deferred)

## Core Entities

| Entity | Description |
|--------|-------------|
| media_items | Public metadata about a book/movie/show |
| user_media_items | User's relationship with a media item |
| media_notes | Notes, quotes, reviews tied to a user's media |
| collections | User-created thematic folders |
| collection_items | Many-to-many: collection ↔ user_media_item |
| activity_logs | Audit trail of user actions |
| jarvis_api_tokens | API tokens for Jarvis integration |
| jarvis_tool_logs | Jarvis tool call audit trail |

## Key Flows

### 1. Add Media (Search)

```
User types query → selects type (Book/Movie/TV)
→ calls /api/metadata/books or /api/metadata/movies or /api/metadata/tv
→ shows results → user picks one
→ upserts media_items → creates user_media_items
→ logs activity
```

### 2. Update Progress

```
User opens detail page → edits progress_current
→ domain service updates user_media_items
→ sets last_interacted_at → logs activity
```

### 3. Status Transition

```
planned → in_progress: auto-set started_at
in_progress → completed: auto-set completed_at, set progress_current = progress_total
completed → in_progress: clear completed_at
```

## Acceptance Criteria

### Auth
- [ ] User can register with email/password
- [ ] User can login
- [ ] Dashboard routes are protected by middleware
- [ ] RLS prevents cross-user data access

### Media Management
- [ ] User can add media manually
- [ ] User can search external APIs and add media
- [ ] User can update status, progress, rating
- [ ] User can view library with filters
- [ ] User can view detail page

### Notes & Collections
- [ ] User can add/edit/delete notes
- [ ] User can create/edit/delete collections
- [ ] User can add/remove media from collections

### Dashboard
- [ ] Shows stats cards (total, in progress, planned, completed)
- [ ] Shows continue section (in-progress items)
- [ ] Shows stale items
- [ ] Shows recent notes

### Jarvis API
- [ ] Token auth works (Bearer token)
- [ ] Read endpoints return correct data
- [ ] Write endpoints create/update correctly
- [ ] All calls are logged
