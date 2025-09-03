import { fetchLyrics } from '../services/lyricsFetcher';
import { LyricsAPIError, LyricsTimeoutError } from '../errors/LyricsErrors';

/**
 * Busca la letra de la canción usando todos los artistas posibles.
 * @returns La letra de la canción o null si no se encuentra después de todos los intentos.
 * @throws {LyricsAPIError} Si hay un error general de la API.
 * @throws {LyricsTimeoutError} Si la solicitud excede el tiempo límite.
 */
export async function findLyrics(
  artists: string[],
  title: string
): Promise<string | null> {
  for (const artist of artists) {
    try {
      const lyrics = await fetchLyrics(artist, title);
      if (lyrics) return lyrics;
    } catch (err) {
      // Re-throw API and Timeout errors immediately
      if (err instanceof LyricsAPIError || err instanceof LyricsTimeoutError) {
        throw err;
      }
      // If it's a LyricsNotFoundError, continue to the next artist
      // or if it's another unexpected error, log and continue
      console.warn(
        `[findLyrics] Error fetching lyrics for ${artist} - ${title}:`,
        err
      );
    }
  }
  if (artists.length > 1) {
    try {
      const lyrics = await fetchLyrics(artists.join(', '), title);
      if (lyrics) return lyrics;
    } catch (err) {
      if (err instanceof LyricsAPIError || err instanceof LyricsTimeoutError) {
        throw err;
      }
      console.warn(
        `[findLyrics] Error fetching lyrics for joined artists - ${title}:`,
        err
      );
    }
  }
  return null; // No lyrics found after all attempts
}
