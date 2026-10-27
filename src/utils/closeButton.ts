import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CLOSE_LYRICS_PREFIX } from './constants';

/**
 * Devuelve un ActionRow con un botón "Cerrar" único para el grupo de mensajes de letra.
 * @param groupId Un identificador único para el grupo de mensajes (por ejemplo, el primer mensaje de letra del tema).
 */
export function createCloseButtonRow(groupId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${CLOSE_LYRICS_PREFIX}${groupId}`)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌')
  );
}
