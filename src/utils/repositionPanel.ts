import { TextChannel } from 'discord.js';
import { createHelpMessage } from './helpMessage';

/**
 * Envía un nuevo panel de ayuda de música en el canal especificado.
 * Usa la función createHelpMessage para generar el embed y los botones,
 * y lo envía al canal. Devuelve el mensaje enviado.
 *
 * @param channel Canal de texto donde se enviará el panel.
 * @param guildId ID del servidor (guild) de Discord.
 * @param channelId ID del canal de texto de Discord.
 * @returns El mensaje enviado (Promise<Message>).
 */
export async function repositionPanel(channel: TextChannel, guildId: string, channelId: string) {
  const { embed, components } = createHelpMessage(guildId, channelId);
  return await channel.send({
    embeds: [embed],
    components,
  });
}
