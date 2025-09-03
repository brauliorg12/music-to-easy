import { TextChannel } from 'discord.js';
import { readPanelState } from '../utils/stateManager';
import { createHelpMessage } from '../utils/helpMessage';

/**
 * Deshabilita el botón "Letra" en el panel de ayuda del canal.
 * @param channel Canal de texto donde está el panel.
 */
export async function disableLyricsButtonInPanel(channel: TextChannel) {
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

/**
 * Elimina todos los mensajes de letra activos en el canal y deshabilita el botón "Letra" en el panel.
 * @param channel Canal de texto donde están los mensajes de letra.
 */
export async function forceLyricsCleanup(channel: TextChannel) {
  // Esta función solo debe ser llamada desde LyricsManager, donde se importa lyricsMessageMap.
  // No se importa aquí para evitar dependencias circulares.
  // El borrado de mensajes y limpieza del map se hace en LyricsManager.
  await disableLyricsButtonInPanel(channel);
}
