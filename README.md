<div align="center">

# Veridia

**Track everything you read, watch, and learn.**

A personal media and knowledge management platform for collecting, tracking, reflecting on, and rediscovering your media consumption.

**English** | [简体中文](./README.zh-CN.md)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-optional-3ecf8e?logo=supabase)](https://supabase.com)
[![SQLite](https://img.shields.io/badge/SQLite-local-003b57?logo=sqlite)](https://www.sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<br />

[Features](#features) | [Quick Start](#quick-start) | [Tech Stack](#tech-stack) | [Architecture](#architecture) | [API](#jarvis-api)

</div>

---

## Features

### Media Library
- Track **books, movies, TV shows, articles, and courses** in one place
- Card and list views with filtering, search, and sorting
- Status management: `planned` → `in_progress` → `completed` / `paused` / `dropped` / `archived`
- Progress tracking (pages, minutes, episodes, labs)
- Half-star ratings (0.5–5)

### Notes & Reflections
- Capture **quotes, reviews, notes, reflections, and summaries**
- Attach location metadata (page numbers, timestamps, episodes)
- AI-powered summarization via Jarvis

### Collections
- Group media into **thematic collections** with custom icons and colors
- Drag-and-drop ordering

### Insights Dashboard
- Consumption statistics and trends
- Stale item detection (untouched for 20+ days)
- Activity timeline

### Jarvis API
- AI assistant integration via REST API
- Token-based authentication with granular permissions (read/write/delete)
- Tool logging and error tracking

### Dual Backend
- **Supabase Cloud** — production-ready with Postgres, RLS, and real-time
- **Local SQLite** — zero-config offline mode with Drizzle ORM

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone https://github.com/alvinluo-tech/Veridia.git
cd Veridia
npm install
```

### Local Mode (no Supabase)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register a new account. Data is stored in `.veridia/data.db`.

### Seed Sample Data

```bash
npx tsx scripts/seed.ts
```

Login with `demo@veridia.app` / `password123`.

### Supabase Mode

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the migration:
   ```bash
   # Apply supabase/migrations/001_initial_schema.sql in the Supabase SQL editor
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Auth | [Supabase Auth](https://supabase.com/auth) / [iron-session](https://github.com/vvo/iron-session) + [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) |
| Database | [Supabase Postgres](https://supabase.com/database) / [SQLite](https://www.sqlite.org) via [Drizzle ORM](https://orm.drizzle.team) |
| Validation | [Zod](https://zod.dev) |
| Forms | [React Hook Form](https://react-hook-form.com) |
| Icons | [Lucide React](https://lucide.dev) |

---

## Architecture

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/    # Overview & stats
│   │   ├── library/      # Media library + detail pages
│   │   ├── notes/        # Notes & reflections
│   │   ├── collections/  # Thematic collections
│   │   ├── insights/     # Consumption analytics
│   │   └── settings/     # User settings
│   ├── actions/          # Server actions (auth, media, notes, collections, jarvis)
│   ├── api/              # REST endpoints (jarvis, metadata)
│   └── auth/             # OAuth callback
├── components/
│   ├── layout/           # Sidebar, top nav
│   └── media/            # Media cards, grids, badges, progress bars
├── lib/
│   ├── auth/             # Auth abstraction (Supabase | local)
│   ├── db/               # SQLite connection, schema, migrations
│   ├── domain/           # Business logic (Supabase queries)
│   ├── repository/       # Data access layer
│   │   ├── supabase/     # Supabase implementation
│   │   └── sqlite/       # Drizzle/SQLite implementation
│   ├── metadata/         # External APIs (Open Library, TMDB, Google Books)
│   ├── supabase/         # Supabase client setup
│   └── utils/            # Shared utilities
├── types/                # TypeScript type definitions
middleware.ts             # Route protection (Edge runtime)
scripts/                  # Seed scripts
supabase/                 # SQL migrations
```

### Repository Pattern

The app uses a **repository pattern** to abstract the database layer. A factory function detects the backend at runtime:

```typescript
// Automatic detection: Supabase if env vars exist, SQLite otherwise
const repo = await getRepository()
const items = await repo.media.searchUserMedia(userId, filters)
```

---

## Jarvis API

The Jarvis API allows AI assistants to interact with Veridia programmatically.

### Authentication

```bash
# Create a token in Settings → API Tokens
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/jarvis/<tool>
```

### Available Tools

| Tool | Method | Description |
|------|--------|-------------|
| `search` | GET | Search media items |
| `get` | GET | Get media item details |
| `add` | POST | Add a new media item |
| `update` | POST | Update progress or status |
| `notes` | GET/POST | List or add notes |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (omit for local mode) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `IRON_SESSION_SECRET` | No | Session encryption secret (min 32 chars) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed.ts` | Seed database with sample data |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add something"`
4. Push and open a Pull Request

---

## License

[MIT](./LICENSE)
