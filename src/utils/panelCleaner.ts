import { TextChannel } from 'discord.js';

export async function cleanupAllHelpPanels(clientUserId: string, channel: TextChannel): Promise<void> {
  try {
    const messages = await channel.messages.fetch({ limit: 30 });
    const helpPanels = messages.filter(
      (msg) =>
        msg.author.id === clientUserId &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title?.includes('Comandos de Música')
    );
    for (const panel of helpPanels.values()) {
      try {
        await panel.delete();
      } catch {}
    }
  } catch {}
}
