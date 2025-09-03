import { TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';

/**
 * Elimina todos los mensajes de panel de ayuda ("Comandos de Música") enviados por el bot
 * en el canal especificado. Útil para limpiar paneles viejos antes de crear uno nuevo.
 *
 * @param clientUserId ID del usuario del bot (para filtrar solo mensajes del bot).
 * @param channel Canal de texto donde buscar y eliminar los paneles.
 */
export async function cleanupAllHelpPanels(
  clientUserId: string,
  channel: TextChannel
): Promise<void> {
  try {
    // Limpia el panel anterior si existe
    const state = readPanelState(channel.guildId);
    if (state?.lastHelpMessageId) {
      try {
        const oldPanel = await channel.messages
          .fetch(state.lastHelpMessageId)
          .catch(() => null);
        if (oldPanel) {
          await oldPanel.delete();
          console.log(`[MusicToEasy] Panel anterior eliminado.`);
        }
      } catch {
        console.log(
          '[MusicToEasy] No se pudo eliminar el panel anterior (puede que ya no exista).'
        );
      }
    }

    // Busca los últimos 30 mensajes en el canal
    const messages = await channel.messages.fetch({ limit: 30 });
    // Filtra los mensajes que son paneles de ayuda enviados por el bot
    const helpPanels = messages.filter(
      (msg) =>
        msg.author.id === clientUserId &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title?.includes('Comandos de Música')
    );
    // Elimina cada panel encontrado
    for (const panel of helpPanels.values()) {
      try {
        await panel.delete();
      } catch {}
    }
  } catch {}
}
