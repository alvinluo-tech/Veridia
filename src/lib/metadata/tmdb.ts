import type { MediaSearchResult } from '@/types/media'

const TMDB_API = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY not configured')

  const searchParams = new URLSearchParams({ api_key: apiKey, ...params })
  const url = `${TMDB_API}${endpoint}?${searchParams}`

  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`)
  }
  return response.json()
}

export async function searchTMDBMovies(query: string): Promise<MediaSearchResult[]> {
  const data = await tmdbFetch('/search/movie', { query, language: 'en-US' })

  return (data.results ?? []).map((movie: any): MediaSearchResult => ({
    source: 'tmdb',
    external_id: String(movie.id),
    title: movie.title ?? 'Untitled',
    original_title: movie.original_title !== movie.title ? movie.original_title : undefined,
    description: movie.overview,
    cover_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined,
    creators: [],
    genres: [],
    language: movie.original_language,
    release_date: movie.release_date,
    metadata: {
      runtime: null,
      vote_average: movie.vote_average,
    },
  }))
}

export async function searchTMDBTV(query: string): Promise<MediaSearchResult[]> {
  const data = await tmdbFetch('/search/tv', { query, language: 'en-US' })

  return (data.results ?? []).map((show: any): MediaSearchResult => ({
    source: 'tmdb',
    external_id: String(show.id),
    title: show.name ?? 'Untitled',
    original_title: show.original_name !== show.name ? show.original_name : undefined,
    description: show.overview,
    cover_url: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
    creators: [],
    genres: [],
    language: show.original_language,
    release_date: show.first_air_date,
    metadata: {
      seasons: show.number_of_seasons,
      episodes: show.number_of_episodes,
      network: show.networks?.[0]?.name,
    },
  }))
}

export async function getMovieDetails(movieId: string): Promise<Record<string, unknown>> {
  const data = await tmdbFetch(`/movie/${movieId}`, { append_to_response: 'credits' })

  return {
    runtime: data.runtime,
    director: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
    cast: data.credits?.cast?.slice(0, 5).map((c: any) => c.name),
  }
}
