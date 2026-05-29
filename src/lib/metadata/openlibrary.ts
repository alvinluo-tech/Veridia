import type { MediaSearchResult } from '@/types/media'

const OPEN_LIBRARY_API = 'https://openlibrary.org'

export async function searchOpenLibrary(query: string): Promise<MediaSearchResult[]> {
  const url = `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=10`
  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.docs ?? []).map((doc: any): MediaSearchResult => {
    const coverId = doc.cover_i
    return {
      source: 'openlibrary',
      external_id: doc.key?.replace('/works/', '') ?? '',
      title: doc.title ?? 'Untitled',
      original_title: doc.title !== doc.title_sort ? doc.title_sort : undefined,
      description: doc.first_sentence?.[0] ?? undefined,
      cover_url: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined,
      creators: (doc.author_name ?? []).map((name: string) => ({ name, role: 'author' })),
      genres: (doc.subject ?? []).slice(0, 5),
      language: doc.language?.[0],
      release_date: doc.first_publish_year ? `${doc.first_publish_year}-01-01` : undefined,
      metadata: {
        isbn: doc.isbn?.[0],
        publisher: doc.publisher?.[0],
        page_count: doc.number_of_pages_median,
      },
    }
  })
}
