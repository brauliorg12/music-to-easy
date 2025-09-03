import { fetchLyrics } from '../services/lyricsFetcher';

/**
 * Busca la letra de la canción usando todos los artistas posibles.
 */
export async function findLyrics(
  artists: string[],
  title: string
): Promise<string | null> {
  for (const artist of artists) {
    try {
      const lyrics = await fetchLyrics(artist, title);
      if (lyrics) return lyrics;
    } catch {}
  }
  if (artists.length > 1) {
    try {
      return await fetchLyrics(artists.join(', '), title);
    } catch {}
  }
  return null;
}
