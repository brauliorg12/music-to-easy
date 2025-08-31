import { TextChannel } from 'discord.js';
import { createHelpMessage } from './helpMessage';

export async function repositionPanel(channel: TextChannel, guildId: string, channelId: string) {
  const { embed, components } = createHelpMessage(guildId, channelId);
  return await channel.send({
    embeds: [embed],
    components,
  });
}
