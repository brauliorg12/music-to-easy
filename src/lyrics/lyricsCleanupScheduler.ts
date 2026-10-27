import { TextChannel } from 'discord.js';
import { cleanupLyrics } from './lyricsCleanup';

const pendingCleanups = new Map<string, NodeJS.Timeout>();

/**
 * Cancela la limpieza de letras pendiente de un canal.
 * @param channelId ID del canal cuya limpieza se cancelará.
 */
export function cancelLyricsCleanup(channelId: string): void {
  const timer = pendingCleanups.get(channelId);
  if (!timer) return;
  clearTimeout(timer);
  pendingCleanups.delete(channelId);
}

/**
 * Programa la limpieza de letras de un canal, reemplazando cualquier limpieza pendiente.
 * @param channel Canal de texto cuyas letras se limpiarán.
 * @param delayMs Milisegundos a esperar antes de limpiar.
 */
export function scheduleLyricsCleanup(
  channel: TextChannel,
  delayMs = 10000
): void {
  cancelLyricsCleanup(channel.id);
  const timer = setTimeout(() => {
    pendingCleanups.delete(channel.id);
    void cleanupLyrics(channel).catch(() => {});
  }, delayMs);
  pendingCleanups.set(channel.id, timer);
}
