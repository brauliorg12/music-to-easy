import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';

export abstract class MusicCommandHandler {
  protected abstract getCommand(): string;
  protected abstract getInstruction(): string;

  public async execute(interaction: ButtonInteraction): Promise<void> {
    try {
      const command = this.getCommand();
      const instruction = this.getInstruction();

      // Crear botón de cerrar
      const closeButton = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.CLOSE)
        .setLabel('Cerrar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        closeButton
      );

      // Mensaje estructurado para mejor UX sin el icono de nota
      const message = [
        '**📋 Copia el comando tocando el campo de abajo:**',
        `\`\`\`${command}\`\`\``,
        instruction
      ].join('\n');

      await interaction.reply({
        content: message,
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[MusicCommandHandler] Error:`, error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Hubo un error al procesar tu solicitud.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'Hubo un error al procesar tu solicitud.',
          ephemeral: true,
        });
      }
    }
  }
}
