import { TextChannel } from 'discord.js';
import { lyricsMessageMap } from '../utils/lyricsMessageMap';
import { disableLyricsButtonInPanel } from './lyricsPanelUtils'; // Importa la función única

/**
 * Mapa de timeouts para eliminar mensajes de letra tras un delay.
 * La clave es el ID del canal.
 */
export const lyricsDeleteTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Programa la eliminación de todos los mensajes de letra en el canal tras un delay.
 * También deshabilita el botón "Letra" en el panel.
 * @param channel Canal de texto donde están los mensajes de letra.
 * @param delayMs Milisegundos a esperar antes de eliminar.
 */
export function scheduleLyricsCleanup(channel: TextChannel, delayMs = 10000) {
  if (lyricsDeleteTimeouts.has(channel.id)) return;
  const lyricsMsgIds = lyricsMessageMap.get(channel.id);
  if (lyricsMsgIds && lyricsMsgIds.length > 0) {
    const timeout = setTimeout(async () => {
      try {
        for (const msgId of lyricsMsgIds) {
          const lyricsMsg = await channel.messages
            .fetch(msgId)
            .catch(() => null);
          if (lyricsMsg) await lyricsMsg.delete();
        }
        lyricsMessageMap.delete(channel.id);
        await disableLyricsButtonInPanel(channel); // Usa la función importada
      } catch {
        lyricsMessageMap.delete(channel.id);
      }
      lyricsDeleteTimeouts.delete(channel.id);
    }, delayMs);
    lyricsDeleteTimeouts.set(channel.id, timeout);
  }
}
