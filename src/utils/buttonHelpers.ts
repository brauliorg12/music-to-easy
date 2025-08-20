import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CUSTOM_IDS } from './constants';

export class ButtonHelpers {
  /**
   * Crea un botón de cerrar reutilizable
   */
  static createCloseButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.CLOSE)
        .setLabel('❌ Cerrar')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  /**
   * Crea una respuesta estandarizada para comandos de música
   */
  static createCommandResponse(command: string, instruction: string): string {
    return `Toca el bloque de código de abajo para copiarlo, ${instruction}:\n\`\`\`\n${command}\n\`\`\``;
  }
}
