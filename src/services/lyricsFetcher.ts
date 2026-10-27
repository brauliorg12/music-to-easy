import {
  LyricsNotFoundError,
  LyricsAPIError,
  LyricsTimeoutError,
} from '../errors/LyricsErrors';

/**
 * Limpia el nombre para consultar la API de letras.
 * @param str Texto a normalizar.
 * @returns Texto sin emojis de Discord ni espacios duplicados.
 */
function normalizeForLyrics(str: string): string {
  return str
    .replace(/<:[^>]+>/g, '') // elimina emojis discord
    .replace(/\s{2,}/g, ' ') // dobles espacios
    .trim();
}

/**
 * Busca la letra de una canción usando lyrics.ovh.
 * @param artist Nombre del artista.
 * @param title Título de la canción.
 * @returns Letra de la canción.
 * @throws {LyricsNotFoundError} Si la letra no se encuentra.
 * @throws {LyricsTimeoutError} Si la solicitud excede el tiempo límite.
 * @throws {LyricsAPIError} Para otros errores de la API.
 */
export async function fetchLyrics(
  artist: string,
  title: string
): Promise<string> {
  const cleanArtist = normalizeForLyrics(artist);
  const cleanTitle = normalizeForLyrics(title);
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(
    cleanArtist
  )}/${encodeURIComponent(cleanTitle)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (res.status === 404) {
      throw new LyricsNotFoundError(
        `Lyrics not found for ${artist} - ${title}`
      );
    }

    if (!res.ok) {
      console.warn(
        `[fetchLyrics] Respuesta no OK (${res.status}) para ${cleanArtist} - ${cleanTitle}`
      );
      throw new LyricsAPIError(`API responded with status ${res.status}`);
    }

    const data = (await res.json()) as { lyrics?: string };
    if (data.lyrics) {
      return data.lyrics.trim();
    }

    throw new LyricsNotFoundError(
      `No lyrics field in response for ${artist} - ${title}`
    );
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError')
    ) {
      throw new LyricsTimeoutError(
        `Timeout fetching lyrics for ${artist} - ${title}`
      );
    } else if (
      err instanceof LyricsNotFoundError ||
      err instanceof LyricsAPIError
    ) {
      throw err;
    } else {
      console.error('[fetchLyrics] Error consultando lyrics.ovh:', err);
      throw new LyricsAPIError(
        `Unknown error fetching lyrics: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}
