import { NextRequest, NextResponse } from 'next/server'
import { searchTMDBMovies } from '@/lib/metadata/tmdb'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } },
      { status: 400 }
    )
  }

  try {
    const results = await searchTMDBMovies(q)
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to search movies' } },
      { status: 500 }
    )
  }
}
