import { TextChannel } from 'discord.js';
import {
  lyricsMessageMap,
  lyricsActiveGroupByChannel,
} from '../utils/lyricsMessageMap';
import { isLyricsEmbedMessage } from '../services/channelCleanup';

/**
 * Limpia de forma robusta todos los mensajes de letras de un canal.
 * - Elimina los mensajes del Map y también busca mensajes "huérfanos" por el footer.
 * - Limpia los Maps de estado.
 * @param channel El canal de texto donde se deben limpiar las letras.
 */
export async function cleanupLyrics(channel: TextChannel) {
  const activeGroupId = lyricsActiveGroupByChannel.get(channel.id);

  if (activeGroupId) {
    const messageIds = lyricsMessageMap.get(activeGroupId);
    if (messageIds) {
      try {
        // Intenta borrar en masa, es más eficiente.
        await channel.bulkDelete(messageIds);
      } catch (error) {
        // Si falla (ej. mensajes muy viejos), borra uno por uno como fallback.
        for (const msgId of messageIds) {
          try {
            const msg = await channel.messages.fetch(msgId);
            await msg.delete();
          } catch {
            // Ignora si el mensaje ya fue borrado.
          }
        }
      }
      lyricsMessageMap.delete(activeGroupId);
    }
    lyricsActiveGroupByChannel.delete(channel.id);
  }

  // Fallback: busca y elimina mensajes de letras que no estén en el Map.
  // Esto es útil si el bot se reinició y perdió el estado en memoria.
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    const orphanMessages = messages.filter((m) => {
      const clientUserId = m.client.user?.id;
      return clientUserId ? isLyricsEmbedMessage(m, clientUserId) : false;
    });

    if (orphanMessages.size > 0) {
      console.log(
        `[Cleanup] Encontrados ${orphanMessages.size} mensajes de letra huérfanos para eliminar.`
      );
      await channel.bulkDelete(orphanMessages);
    }
  } catch (error) {
    // Ignora si falla la búsqueda o el borrado.
  }
}
