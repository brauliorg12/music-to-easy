import { Message } from 'discord.js';
import { COMMON_MUSIC_BOTS } from './constants';

/**
 * Enum que representa el estado de la música detectado en un mensaje de bot de música.
 * - Playing: Se está reproduciendo una canción.
 * - NoMoreTracks: No hay más canciones en la cola.
 * - Leaving: El bot de música se va del canal o no hay actividad.
 * - Unknown: No se pudo determinar el estado.
 */
export enum JockieMusicStatus {
  Playing,
  NoMoreTracks,
  Leaving,
  Unknown,
}

/**
 * Analiza el contenido de un mensaje de un bot de música y determina el estado actual de la reproducción.
 * @param message Mensaje de Discord a analizar.
 * @returns Estado de la música (JockieMusicStatus) o null si no es de un bot relevante.
 */
export function detectJockieMusicStatus(
  message: Message
): JockieMusicStatus | null {
  if (!COMMON_MUSIC_BOTS.includes(message.author.id)) return null;

  // Analiza el contenido del mensaje y también el primer embed (si existe)
  let content = message.content.toLowerCase();
  if (message.embeds.length > 0) {
    const embed = message.embeds[0];
    if (embed.description) content += ' ' + embed.description.toLowerCase();
    if (embed.title) content += ' ' + embed.title.toLowerCase();
    if (embed.fields) {
      for (const field of embed.fields) {
        if (field.value) content += ' ' + field.value.toLowerCase();
      }
    }
  }

  if (content.includes('started playing')) {
    return JockieMusicStatus.Playing;
  }
  if (content.includes('no more tracks')) {
    return JockieMusicStatus.NoMoreTracks;
  }
  if (
    content.includes('leaving') ||
    content.includes('no tracks have been playing') ||
    content.includes('thank you for using our service')
  ) {
    return JockieMusicStatus.Leaving;
  }
  return JockieMusicStatus.Unknown;
}
