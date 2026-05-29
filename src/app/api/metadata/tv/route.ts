import { NextRequest, NextResponse } from 'next/server'
import { searchTMDBTV } from '@/lib/metadata/tmdb'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } },
      { status: 400 }
    )
  }

  try {
    const results = await searchTMDBTV(q)
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to search TV shows' } },
      { status: 500 }
    )
  }
}
