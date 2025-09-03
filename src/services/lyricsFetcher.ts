import fetch from 'node-fetch';

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
 * @returns Letra de la canción o null si no se encuentra
 */
export async function fetchLyrics(
  artist: string,
  title: string
): Promise<string | null> {
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
    if (!res.ok) {
      console.warn(`[fetchLyrics] Respuesta no OK (${res.status}): ${url}`);
      return null;
    }
    const data = await res.json();
    if (data.lyrics) {
      console.log(
        `[fetchLyrics] Letra encontrada (${cleanArtist} - ${cleanTitle}):`
      );
      return data.lyrics.trim();
    }
    console.warn(
      `[fetchLyrics] No se encontró letra (${cleanArtist} - ${cleanTitle})`
    );
    return null;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[fetchLyrics] Timeout (${cleanArtist} - ${cleanTitle})`);
    } else {
      console.error(`[fetchLyrics] Error consultando lyrics.ovh:`, err);
    }
    return null;
  }
}
