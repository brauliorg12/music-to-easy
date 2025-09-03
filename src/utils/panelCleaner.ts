import { TextChannel } from 'discord.js';

/**
 * Elimina todos los mensajes de panel de ayuda ("Comandos de Música") enviados por el bot
 * en el canal especificado. Barre los últimos 100 mensajes para asegurar que no queden duplicados.
 *
 * @param clientUserId ID del usuario del bot (para filtrar solo mensajes del bot).
 * @param channel Canal de texto donde buscar y eliminar los paneles.
 */
export async function cleanupAllHelpPanels(
  clientUserId: string,
  channel: TextChannel
): Promise<void> {
  try {
    // Busca en los últimos 100 mensajes. Es el máximo permitido por la API.
    const messages = await channel.messages.fetch({ limit: 100 });

    // Filtra TODOS los mensajes que son paneles de ayuda enviados por este bot.
    const helpPanels = messages.filter(
      (msg) =>
        msg.author.id === clientUserId &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title?.includes('Comandos de Música')
    );

    if (helpPanels.size === 0) {
      return; // No hay paneles que limpiar.
    }

    console.log(
      `[PanelCleaner] Se encontraron ${helpPanels.size} paneles antiguos para limpiar en #${channel.name}.`
    );

    // Elimina todos los paneles encontrados.
    // Usar bulkDelete es más eficiente para borrar múltiples mensajes, pero puede fallar con mensajes de más de 14 días.
    await channel.bulkDelete(helpPanels);
  } catch (err) {
    console.warn(
      `[PanelCleaner] No se pudieron limpiar los paneles antiguos en el canal #${channel.name}. Puede que no tuviera permisos o los mensajes eran muy antiguos.`
    );
  }
}
