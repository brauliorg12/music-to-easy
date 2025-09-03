import { TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';
import { createHelpMessage } from './helpMessage';
import { lyricsMessageMap } from './lyricsMessageMap';

const lyricsDeleteTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Programa la eliminación de todos los mensajes de letra en un canal después de un timeout.
 * Si ya hay un timeout pendiente para ese canal, no hace nada.
 */
export function scheduleLyricsDeletion(channel: TextChannel, delayMs = 10000) {
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
        await disableLyricsButtonInPanel(channel);
      } catch {
        lyricsMessageMap.delete(channel.id);
      }
      lyricsDeleteTimeouts.delete(channel.id);
    }, delayMs);
    lyricsDeleteTimeouts.set(channel.id, timeout);
  }
}

/**
 * Elimina todos los mensajes de letra y cancela el timeout si existe.
 */
export async function forceLyricsCleanup(channel: TextChannel) {
  if (lyricsDeleteTimeouts.has(channel.id)) {
    clearTimeout(lyricsDeleteTimeouts.get(channel.id));
    lyricsDeleteTimeouts.delete(channel.id);
  }
  const lyricsMsgIds = lyricsMessageMap.get(channel.id);
  if (lyricsMsgIds && lyricsMsgIds.length > 0) {
    for (const msgId of lyricsMsgIds) {
      const lyricsMsg = await channel.messages.fetch(msgId).catch(() => null);
      if (lyricsMsg) await lyricsMsg.delete();
    }
    lyricsMessageMap.delete(channel.id);
    await disableLyricsButtonInPanel(channel);
  }
}

/**
 * Actualiza el panel del canal para deshabilitar el botón "Letra".
 */
async function disableLyricsButtonInPanel(channel: TextChannel) {
  // Busca el panel actual y lo reemplaza por uno con el botón deshabilitado
  const state = readPanelState(channel.guildId);
  if (!state?.lastHelpMessageId) return;
  try {
    const panelMsg = await channel.messages.fetch(state.lastHelpMessageId);
    const { embed, components } = createHelpMessage(
      channel.guildId,
      channel.id,
      false
    );
    await panelMsg.edit({ embeds: [embed], components });
  } catch {
    // Si el mensaje no existe, ignora
  }
}
