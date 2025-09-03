import fetch from 'node-fetch';
import {
  LyricsNotFoundError,
  LyricsAPIError,
  LyricsTimeoutError,
} from '../errors/LyricsErrors'; // Import the new error classes

/**
 * Limpia el nombre para consulta de letras.
 */
function normalizeForLyrics(str: string): string {
  return str
    .replace(/<:[^>]+>/g, '') // elimina emojis discord
    .replace(/\s{2,}/g, ' ') // dobles espacios
    .trim();
}

/**
 * Busca la letra de una canción usando lyrics.ovh.
 * @param artist Nombre del artista
 * @param title Título de la canción
 * @returns Letra de la canción
 * @throws {LyricsNotFoundError} Si la letra no se encuentra.
 * @throws {LyricsTimeoutError} Si la solicitud excede el tiempo límite.
 * @throws {LyricsAPIError} Para otros errores de la API.
 */
export async function fetchLyrics(
  artist: string,
  title: string
): Promise<string> {
  // Changed return type to string, as it will throw on error
  const cleanArtist = normalizeForLyrics(artist);
  const cleanTitle = normalizeForLyrics(title);
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(
    cleanArtist
  )}/${encodeURIComponent(cleanTitle)}`;
  console.log(`[fetchLyrics] Consultando: ${url}`);
  try {
    const controller = new AbortController();
    const timeoutMs = 10000; // 10 segundos para pruebas
    const start = Date.now();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const elapsed = Date.now() - start;
    console.log(`[fetchLyrics] Tiempo de respuesta: ${elapsed} ms`);

    if (res.status === 404) {
      throw new LyricsNotFoundError(
        `Lyrics not found for ${artist} - ${title}`
      );
    }

    if (!res.ok) {
      console.warn(`[fetchLyrics] Respuesta no OK (${res.status}): ${url}`);
      throw new LyricsAPIError(`API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.lyrics) {
      console.log(
        `[fetchLyrics] Letra encontrada (${cleanArtist} - ${cleanTitle}):`
      );
      return data.lyrics.trim();
    }

    // If res.ok but no lyrics in data (e.g., empty response or unexpected format)
    throw new LyricsNotFoundError(
      `No lyrics field in response for ${artist} - ${title}`
    );
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[fetchLyrics] Timeout (${cleanArtist} - ${cleanTitle})`);
      throw new LyricsTimeoutError(
        `Timeout fetching lyrics for ${artist} - ${title}`
      );
    } else if (
      err instanceof LyricsNotFoundError ||
      err instanceof LyricsAPIError
    ) {
      throw err; // Re-throw custom errors
    } else {
      console.error(`[fetchLyrics] Error consultando lyrics.ovh:`, err);
      throw new LyricsAPIError(
        `Unknown error fetching lyrics: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}
