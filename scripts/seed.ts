import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { hash } from 'bcryptjs'
import * as path from 'path'
import * as fs from 'fs'
import { runMigrations } from '../src/lib/db/migrate'

async function main() {
const dbPath = path.join(process.cwd(), '.veridia', 'data.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite)
runMigrations(db)

// Clear existing data for a clean seed
sqlite.exec('DELETE FROM activity_logs')
sqlite.exec('DELETE FROM collection_items')
sqlite.exec('DELETE FROM collections')
sqlite.exec('DELETE FROM media_notes')
sqlite.exec('DELETE FROM user_media_items')
sqlite.exec('DELETE FROM media_items')
sqlite.exec('DELETE FROM users')
console.log('Cleared existing data')

// ── Helper ──────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID()
}
function now() {
  return new Date().toISOString()
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
function dateStr(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ── User ────────────────────────────────────────────────
const userId = uuid()
const passwordHash = await hash('password123', 12)

sqlite.prepare(`INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
  userId, 'demo@veridia.app', 'Demo User', passwordHash, daysAgo(90), now(),
)
console.log('Created user: demo@veridia.app / password123')

// ── Media Items ─────────────────────────────────────────
const mediaItems = [
  // Books
  { id: uuid(), type: 'book', title: 'Project Hail Mary', original_title: null, description: 'A lone astronaut must save humanity from an extinction-level threat.', cover_url: 'https://covers.openlibrary.org/b/id/10958422-L.jpg', creators: JSON.stringify([{ name: 'Andy Weir', role: 'author' }]), genres: JSON.stringify(['sci-fi', 'adventure']), language: 'en', release_date: '2021-05-04', external_source: 'open_library', external_id: 'OL2821370W', metadata: JSON.stringify({ pages: 496, isbn: '9780593135204' }) },
  { id: uuid(), type: 'book', title: 'Dune', original_title: null, description: 'A story of politics, religion, and ecology on a desert planet.', cover_url: 'https://covers.openlibrary.org/b/id/11153217-L.jpg', creators: JSON.stringify([{ name: 'Frank Herbert', role: 'author' }]), genres: JSON.stringify(['sci-fi', 'classic']), language: 'en', release_date: '1965-08-01', external_source: 'open_library', external_id: 'OL186477W', metadata: JSON.stringify({ pages: 688, isbn: '9780441172719' }) },
  { id: uuid(), type: 'book', title: 'Sapiens', original_title: 'קיצור תולדות האנושות', description: 'A brief history of humankind.', cover_url: 'https://covers.openlibrary.org/b/id/10487512-L.jpg', creators: JSON.stringify([{ name: 'Yuval Noah Harari', role: 'author' }]), genres: JSON.stringify(['non-fiction', 'history']), language: 'en', release_date: '2011-01-01', external_source: 'open_library', external_id: 'OL17940836W', metadata: JSON.stringify({ pages: 443 }) },
  { id: uuid(), type: 'book', title: 'The Design of Everyday Things', original_title: null, description: 'How design serves as the communication between object and user.', cover_url: 'https://covers.openlibrary.org/b/id/8759623-L.jpg', creators: JSON.stringify([{ name: 'Don Norman', role: 'author' }]), genres: JSON.stringify(['design', 'non-fiction']), language: 'en', release_date: '1988-01-01', external_source: 'open_library', external_id: 'OL228256W', metadata: JSON.stringify({ pages: 240 }) },
  // Movies
  { id: uuid(), type: 'movie', title: 'Interstellar', original_title: null, description: 'A team of explorers travel through a wormhole in space.', cover_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', creators: JSON.stringify([{ name: 'Christopher Nolan', role: 'director' }, { name: 'Matthew McConaughey', role: 'actor' }]), genres: JSON.stringify(['sci-fi', 'drama']), language: 'en', release_date: '2014-11-07', external_source: 'tmdb', external_id: '157336', metadata: JSON.stringify({ runtime: 169, rating_tmdb: 8.4 }) },
  { id: uuid(), type: 'movie', title: 'Parasite', original_title: '기생충', description: 'Greed and class discrimination threaten the relationship between a wealthy and a poor family.', cover_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', creators: JSON.stringify([{ name: 'Bong Joon-ho', role: 'director' }]), genres: JSON.stringify(['thriller', 'drama']), language: 'ko', release_date: '2019-05-30', external_source: 'tmdb', external_id: '496243', metadata: JSON.stringify({ runtime: 132, rating_tmdb: 8.5 }) },
  { id: uuid(), type: 'movie', title: 'The Grand Budapest Hotel', original_title: null, description: 'A writer encounters the owner of an aging high-class hotel.', cover_url: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', creators: JSON.stringify([{ name: 'Wes Anderson', role: 'director' }]), genres: JSON.stringify(['comedy', 'drama']), language: 'en', release_date: '2014-03-07', external_source: 'tmdb', external_id: '120467', metadata: JSON.stringify({ runtime: 99, rating_tmdb: 8.1 }) },
  // TV Shows
  { id: uuid(), type: 'tv', title: 'Severance', original_title: null, description: 'Employees of Lumon Industries agree to a procedure that separates work and personal memories.', cover_url: 'https://image.tmdb.org/t/p/w500/lFf1mYfOjGQr2BxQQJGTzG0kUBV.jpg', creators: JSON.stringify([{ name: 'Dan Erickson', role: 'creator' }]), genres: JSON.stringify(['thriller', 'sci-fi', 'drama']), language: 'en', release_date: '2022-02-18', external_source: 'tmdb', external_id: '95396', metadata: JSON.stringify({ seasons: 2, episodes: 19 }) },
  { id: uuid(), type: 'tv', title: 'Shogun', original_title: '将軍', description: 'Set in 1600 Japan, an English navigator becomes entangled in a political struggle.', cover_url: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgmT.jpg', creators: JSON.stringify([{ name: 'Rachel Kondo', role: 'creator' }, { name: 'Justin Marks', role: 'creator' }]), genres: JSON.stringify(['drama', 'history']), language: 'ja', release_date: '2024-02-27', external_source: 'tmdb', external_id: '126309', metadata: JSON.stringify({ seasons: 1, episodes: 10 }) },
  // Articles
  { id: uuid(), type: 'article', title: 'The Rise of AI Agents', original_title: null, description: 'How autonomous AI agents are reshaping software development.', cover_url: null, creators: JSON.stringify([{ name: 'Andrej Karpathy', role: 'author' }]), genres: JSON.stringify(['technology', 'AI']), language: 'en', release_date: '2025-01-15', external_source: 'manual', external_id: null, metadata: JSON.stringify({ url: 'https://example.com/ai-agents' }) },
  // Courses
  { id: uuid(), type: 'course', title: 'MIT 6.S081: Operating System Engineering', original_title: null, description: 'Introduction to operating systems, including xv6 labs.', cover_url: null, creators: JSON.stringify([{ name: 'Robert Morris', role: 'instructor' }, { name: 'Frans Kaashoek', role: 'instructor' }]), genres: JSON.stringify(['computer-science', 'systems']), language: 'en', release_date: '2024-09-01', external_source: 'manual', external_id: null, metadata: JSON.stringify({ platform: 'MIT OCW', url: 'https://pdos.csail.mit.edu/6.S081/' }) },
]

// Insert all media items
const insertMedia = sqlite.prepare(`INSERT INTO media_items (id, type, title, original_title, description, cover_url, creators, genres, language, release_date, external_source, external_id, metadata, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
for (const m of mediaItems) {
  insertMedia.run(m.id, m.type, m.title, m.original_title, m.description, m.cover_url, m.creators, m.genres, m.language, m.release_date, m.external_source, m.external_id, m.metadata, daysAgo(85), now())
}
console.log(`Created ${mediaItems.length} media items`)

// ── User Media Items ────────────────────────────────────
const byTitle = (t: string) => mediaItems.find(m => m.title === t)!

const userMediaItems = [
  // Completed
  { id: uuid(), media: byTitle('Project Hail Mary'), status: 'completed', priority: 5, progress_current: 496, progress_total: 496, progress_unit: 'pages', rating: 9.5, reason_to_consume: 'Loved The Martian', started_at: dateStr(60), completed_at: dateStr(30), last_interacted: 30, is_favorite: true },
  { id: uuid(), media: byTitle('Interstellar'), status: 'completed', priority: 4, progress_current: 169, progress_total: 169, progress_unit: 'minutes', rating: 9, reason_to_consume: null, started_at: dateStr(50), completed_at: dateStr(50), last_interacted: 50, is_favorite: true },
  { id: uuid(), media: byTitle('Parasite'), status: 'completed', priority: 4, progress_current: 132, progress_total: 132, progress_unit: 'minutes', rating: 8.5, reason_to_consume: 'Won Best Picture', started_at: dateStr(40), completed_at: dateStr(40), last_interacted: 40, is_favorite: false },
  { id: uuid(), media: byTitle('Sapiens'), status: 'completed', priority: 3, progress_current: 443, progress_total: 443, progress_unit: 'pages', rating: 7.5, reason_to_consume: null, started_at: dateStr(75), completed_at: dateStr(45), last_interacted: 45, is_favorite: false },

  // In Progress
  { id: uuid(), media: byTitle('Dune'), status: 'in_progress', priority: 5, progress_current: 312, progress_total: 688, progress_unit: 'pages', rating: null, reason_to_consume: 'Before watching the movie', started_at: dateStr(14), completed_at: null, last_interacted: 2, is_favorite: false },
  { id: uuid(), media: byTitle('Severance'), status: 'in_progress', priority: 4, progress_current: 7, progress_total: 19, progress_unit: 'episodes', rating: null, reason_to_consume: null, started_at: dateStr(10), completed_at: null, last_interacted: 1, is_favorite: true },
  { id: uuid(), media: byTitle('MIT 6.S081: Operating System Engineering'), status: 'in_progress', priority: 3, progress_current: 5, progress_total: 11, progress_unit: 'labs', rating: null, reason_to_consume: 'Learn systems programming', started_at: dateStr(30), completed_at: null, last_interacted: 5, is_favorite: false },

  // Stale (in_progress but not touched for 20+ days)
  { id: uuid(), media: byTitle('The Design of Everyday Things'), status: 'in_progress', priority: 2, progress_current: 80, progress_total: 240, progress_unit: 'pages', rating: null, reason_to_consume: null, started_at: dateStr(40), completed_at: null, last_interacted: 25, is_favorite: false },

  // Planned
  { id: uuid(), media: byTitle('The Grand Budapest Hotel'), status: 'planned', priority: 3, progress_current: 0, progress_total: null, progress_unit: null, rating: null, reason_to_consume: 'Love Wes Anderson', started_at: null, completed_at: null, last_interacted: null, is_favorite: false },
  { id: uuid(), media: byTitle('Shogun'), status: 'planned', priority: 4, progress_current: 0, progress_total: null, progress_unit: null, rating: null, reason_to_consume: 'Heard great things', started_at: null, completed_at: null, last_interacted: null, is_favorite: false },
  { id: uuid(), media: byTitle('The Rise of AI Agents'), status: 'planned', priority: 3, progress_current: 0, progress_total: null, progress_unit: null, rating: null, reason_to_consume: null, started_at: null, completed_at: null, last_interacted: null, is_favorite: false },
]

const nowStr = now()
const insertUserMedia = sqlite.prepare(`INSERT INTO user_media_items (id, user_id, media_id, status, priority, progress_current, progress_total, progress_unit, rating, personal_note, reason_to_consume, started_at, completed_at, last_interacted_at, is_favorite, is_private, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
for (const um of userMediaItems) {
  insertUserMedia.run(um.id, userId, um.media.id, um.status, um.priority, um.progress_current, um.progress_total, um.progress_unit, um.rating, null, um.reason_to_consume, um.started_at, um.completed_at, um.last_interacted ? daysAgo(um.last_interacted) : null, um.is_favorite ? 1 : 0, 0, daysAgo(85), nowStr)
}
console.log(`Created ${userMediaItems.length} user media items`)

// ── Notes ───────────────────────────────────────────────
const projectHailMary = userMediaItems[0]
const dune = userMediaItems[4]
const severance = userMediaItems[5]
const sapiens = userMediaItems[3]

const notes = [
  // Quotes
  { id: uuid(), user_media_id: projectHailMary.id, type: 'quote', content: '"I penetrated the outer cell membrane with a nanotube. You poked it with a stick. Same thing." — Rocky', location_label: 'Chapter 24', page_number: 189 },
  { id: uuid(), user_media_id: dune.id, type: 'quote', content: '"I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration." — Bene Gesserit Litany Against Fear', location_label: null, page_number: 8 },
  { id: uuid(), user_media_id: sapiens.id, type: 'quote', content: '"You could never convince a monkey to give you a banana by promising him limitless bananas after death in monkey heaven." — Harari', location_label: 'Chapter 2', page_number: 28 },

  // Reviews
  { id: uuid(), user_media_id: projectHailMary.id, type: 'review', content: 'Absolutely loved this book. The relationship between Grace and Rocky is one of the best sci-fi friendships ever written. Weir balances hard science with humor perfectly. The ending had me in tears.', location_label: null },
  { id: uuid(), user_media_id: sapiens.id, type: 'review', content: 'Fascinating overview of human history, though some arguments feel oversimplified. The cognitive revolution chapter is brilliant. The agricultural revolution as "history\'s biggest fraud" is a memorable framing.', location_label: null },

  // Notes
  { id: uuid(), user_media_id: dune.id, type: 'note', content: 'The Bene Gesserit breeding program is such an interesting plot device. They\'ve been manipulating bloodlines for thousands of years to produce the Kwisatz Haderach. Paul was born one generation too early.', location_label: null, page_number: 150 },
  { id: uuid(), user_media_id: severance.id, type: 'note', content: 'The "innie" and "outie" concept raises fascinating philosophical questions about personal identity. Are they the same person? The show never gives easy answers.', location_label: 'S1E4' },
  { id: uuid(), user_media_id: severance.id, type: 'reflection', content: 'The severance procedure is a metaphor for work-life balance taken to its extreme. What if you could completely separate your work self from your personal self? Would either version be truly happy?', location_label: null },

  // Summary
  { id: uuid(), user_media_id: projectHailMary.id, type: 'summary', content: 'Ryland Grace wakes up alone on a spaceship with no memory. He discovers he\'s humanity\'s last hope against an astrophage threat consuming the sun. Along the way he befriends an alien engineer named Rocky. Together they develop a solution to save both their worlds.', location_label: null },
]

const insertNote = sqlite.prepare(`INSERT INTO media_notes (id, user_id, user_media_id, type, content, location_label, page_number, timestamp_seconds, season_number, episode_number, ai_summary, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
for (const n of notes) {
  insertNote.run(n.id, userId, n.user_media_id, n.type, n.content, n.location_label ?? null, n.page_number ?? null, null, null, null, null, daysAgo(Math.floor(Math.random() * 30)), nowStr)
}
console.log(`Created ${notes.length} notes`)

// ── Collections ─────────────────────────────────────────
const collections = [
  { id: uuid(), name: 'Mind-Bending Sci-Fi', description: 'Books and films that make you rethink reality', icon: '🌌', color: '#6366f1' },
  { id: uuid(), name: 'Best of 2024', description: 'My favorite media from this year', icon: '⭐', color: '#eab308' },
  { id: uuid(), name: 'To Learn', description: 'Educational content and courses', icon: '📚', color: '#22c55e' },
]

const insertCollection = sqlite.prepare(`INSERT INTO collections (id, user_id, name, description, icon, color, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`)
for (const c of collections) {
  insertCollection.run(c.id, userId, c.name, c.description, c.icon, c.color, daysAgo(60), nowStr)
}

// Add items to collections
const sciFiColl = collections[0]
const bestOfColl = collections[1]
const learnColl = collections[2]

const collectionItems = [
  { collection_id: sciFiColl.id, user_media_id: projectHailMary.id, position: 0 },
  { collection_id: sciFiColl.id, user_media_id: dune.id, position: 1 },
  { collection_id: sciFiColl.id, user_media_id: severance.id, position: 2 },
  { collection_id: sciFiColl.id, user_media_id: userMediaItems.find(u => u.media.title === 'Interstellar')!.id, position: 3 },
  { collection_id: bestOfColl.id, user_media_id: projectHailMary.id, position: 0 },
  { collection_id: bestOfColl.id, user_media_id: userMediaItems.find(u => u.media.title === 'Parasite')!.id, position: 1 },
  { collection_id: bestOfColl.id, user_media_id: severance.id, position: 2 },
  { collection_id: learnColl.id, user_media_id: userMediaItems.find(u => u.media.title === 'MIT 6.S081: Operating System Engineering')!.id, position: 0 },
  { collection_id: learnColl.id, user_media_id: sapiens.id, position: 1 },
  { collection_id: learnColl.id, user_media_id: userMediaItems.find(u => u.media.title === 'The Design of Everyday Things')!.id, position: 2 },
]

const insertCollectionItem = sqlite.prepare(`INSERT INTO collection_items (collection_id, user_media_id, position, created_at) VALUES (?,?,?,?)`)
for (const ci of collectionItems) {
  insertCollectionItem.run(ci.collection_id, ci.user_media_id, ci.position, daysAgo(55))
}
console.log(`Created ${collections.length} collections with ${collectionItems.length} items`)

// ── Activity Logs ───────────────────────────────────────
const activityLogs = [
  { action: 'media_added', user_media_id: projectHailMary.id, new_value: { title: 'Project Hail Mary', type: 'book' }, source: 'web', days: 85 },
  { action: 'media_added', user_media_id: dune.id, new_value: { title: 'Dune', type: 'book' }, source: 'web', days: 80 },
  { action: 'status_updated', user_media_id: projectHailMary.id, new_value: { status: 'in_progress' }, source: 'web', days: 60 },
  { action: 'media_added', user_media_id: userMediaItems.find(u => u.media.title === 'Interstellar')!.id, new_value: { title: 'Interstellar', type: 'movie' }, source: 'jarvis', days: 55 },
  { action: 'progress_updated', user_media_id: projectHailMary.id, new_value: { progress_current: 250 }, source: 'web', days: 45 },
  { action: 'collection_created', new_value: { name: 'Mind-Bending Sci-Fi' }, source: 'web', days: 60 },
  { action: 'status_updated', user_media_id: projectHailMary.id, new_value: { status: 'completed' }, source: 'web', days: 30 },
  { action: 'rating_updated', user_media_id: projectHailMary.id, new_value: { rating: 9.5 }, source: 'web', days: 30 },
  { action: 'note_added', user_media_id: projectHailMary.id, new_value: { type: 'review' }, source: 'web', days: 29 },
  { action: 'media_added', user_media_id: severance.id, new_value: { title: 'Severance', type: 'tv' }, source: 'web', days: 10 },
  { action: 'progress_updated', user_media_id: dune.id, new_value: { progress_current: 312 }, source: 'jarvis', days: 2 },
  { action: 'progress_updated', user_media_id: severance.id, new_value: { progress_current: 7 }, source: 'web', days: 1 },
]

const insertActivity = sqlite.prepare(`INSERT INTO activity_logs (id, user_id, user_media_id, action, old_value, new_value, source, created_at) VALUES (?,?,?,?,?,?,?,?)`)
for (const a of activityLogs) {
  insertActivity.run(uuid(), userId, a.user_media_id ?? null, a.action, null, JSON.stringify(a.new_value), a.source, daysAgo(a.days))
}
console.log(`Created ${activityLogs.length} activity logs`)

console.log('\n✅ Seed complete! Login with demo@veridia.app / password123')
}

main().catch(console.error)
