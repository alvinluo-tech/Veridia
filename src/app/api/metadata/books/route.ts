import { NextRequest, NextResponse } from 'next/server'
import { searchOpenLibrary } from '@/lib/metadata/openlibrary'
import { searchGoogleBooks } from '@/lib/metadata/google-books'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } },
      { status: 400 }
    )
  }

  try {
    // Try Open Library first
    const openLibraryResults = await searchOpenLibrary(q)

    // If we have enough results, return them
    if (openLibraryResults.length >= 5) {
      return NextResponse.json({ success: true, data: openLibraryResults })
    }

    // Supplement with Google Books
    try {
      const googleResults = await searchGoogleBooks(q)
      // Deduplicate by title similarity
      const existingTitles = new Set(openLibraryResults.map(r => r.title.toLowerCase()))
      const uniqueGoogleResults = googleResults.filter(
        r => !existingTitles.has(r.title.toLowerCase())
      )
      return NextResponse.json({
        success: true,
        data: [...openLibraryResults, ...uniqueGoogleResults],
      })
    } catch {
      // Google Books failed, return Open Library results only
      return NextResponse.json({ success: true, data: openLibraryResults })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to search books' } },
      { status: 500 }
    )
  }
}
