import type { MediaSearchResult } from '@/types/media'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

export async function searchGoogleBooks(query: string): Promise<MediaSearchResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=10${apiKey ? `&key=${apiKey}` : ''}`

  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.items ?? []).map((item: any): MediaSearchResult => {
    const info = item.volumeInfo ?? {}
    const imageLinks = info.imageLinks ?? {}

    return {
      source: 'google_books',
      external_id: item.id ?? '',
      title: info.title ?? 'Untitled',
      original_title: info.title !== info.subtitle ? info.subtitle : undefined,
      description: info.description,
      cover_url: imageLinks.thumbnail?.replace('http:', 'https:'),
      creators: (info.authors ?? []).map((name: string) => ({ name, role: 'author' })),
      genres: info.categories ?? [],
      language: info.language,
      release_date: info.publishedDate,
      metadata: {
        isbn: info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier,
        publisher: info.publisher,
        page_count: info.pageCount,
      },
    }
  })
}
