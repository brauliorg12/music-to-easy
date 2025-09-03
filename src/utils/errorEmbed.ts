import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS } from './constants'; // Import CUSTOM_IDS

/**
 * Crea un embed de error con un borde rojo y un botón de cerrar.
 * @param errorMessage El mensaje de error a mostrar.
 * @param groupId Opcional. Un ID de grupo para el botón de cerrar, si es necesario.
 * @returns Un objeto con el embed y los componentes (botones) para enviar en Discord.
 */
export function createErrorEmbed(errorMessage: string, groupId?: string) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c) // Un color rojo para errores
    .setTitle('Error')
    .setDescription(errorMessage)
    .setTimestamp();

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  // The close button for errors will use the generic CLOSE custom ID
  const errorCloseButtonRow =
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.CLOSE) // Use the generic CLOSE custom ID
        .setLabel('Cerrar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌')
    );
  components.push(errorCloseButtonRow);

  return {
    embeds: [embed],
    components: components,
  };
}
