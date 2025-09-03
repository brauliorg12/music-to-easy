import { ButtonInteraction } from 'discord.js';
import {
  lyricsMessageMap,
  lyricsActiveGroupByChannel,
} from '../utils/lyricsMessageMap';

/**
 * Cierra cualquier mensaje (efímero o público) al pulsar el botón "Cerrar".
 * Si es efímero, lo elimina completamente. Si es público, borra todos los cards del grupo (si aplica).
 */
export async function execute(interaction: ButtonInteraction): Promise<void> {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased()) return;

  try {
    if (interaction.customId.startsWith('close_lyrics_')) {
      // Cierre de grupo de letras: elimina todos los mensajes públicos por ID
      const groupId = interaction.customId.replace('close_lyrics_', '');
      const ids = lyricsMessageMap.get(groupId) ?? [];
      for (const id of ids) {
        try {
          const msg = await channel.messages.fetch(id).catch(() => null);
          if (msg) await msg.delete();
        } catch {}
      }
      lyricsMessageMap.delete(groupId);
      for (const [chanId, gId] of lyricsActiveGroupByChannel.entries()) {
        if (gId === groupId) lyricsActiveGroupByChannel.delete(chanId);
      }
      // No intentes eliminar el mensaje efímero aquí, porque el botón está en un mensaje público
      return;
    }

    // Cierre genérico (ayuda, sugerencias, etc.): elimina efímero y público de la interacción
    try {
      // Actualiza el mensaje efímero para cerrarlo visualmente
      await interaction.update({
        content: 'Mensaje cerrado...',
        components: [],
        embeds: [],
      });
    } catch {}
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.deleteReply();
      }
    } catch {}
    try {
      await interaction.message.delete();
    } catch {}
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Close] Error al cerrar mensaje:', errorMessage);
  }
}
