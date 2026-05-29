import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { runMigrations } from './migrate'
import * as path from 'path'
import * as fs from 'fs'

let db: BetterSQLite3Database | null = null

export function isLocalMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function getSqliteDb(): BetterSQLite3Database {
  if (db) return db

  const dbPath = path.join(process.cwd(), '.veridia', 'data.db')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite)
  runMigrations(db)

  return db
}
