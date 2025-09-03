import { ButtonInteraction } from 'discord.js';
import { lyricsMessageMap } from '../utils/lyricsMessageMap';

/**
 * Elimina todos los mensajes de letra asociados al groupId del customId.
 */
export async function execute(interaction: ButtonInteraction): Promise<void> {
  const groupId = interaction.customId.replace('close_lyrics_', '');
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased()) return;

  const ids = lyricsMessageMap.get(groupId) ?? [];
  for (const id of ids) {
    try {
      const msg = await channel.messages.fetch(id).catch(() => null);
      if (msg) await msg.delete();
    } catch {}
  }
  lyricsMessageMap.delete(groupId);

  try {
    await interaction.deleteReply();
  } catch {}
}
