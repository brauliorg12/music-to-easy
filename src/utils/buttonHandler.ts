import { ButtonInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';
import { CUSTOM_IDS } from './constants';
import { handleLyricsButton } from '../lyrics/LyricsManager';
import { execute as closeExecute } from '../interactions/close';

/**
 * Maneja la interacción de botones personalizados en Discord.
 * Ejecuta el handler correspondiente según el customId.
 * Si no existe, muestra una advertencia en consola.
 * Si ocurre un error, responde al usuario con un mensaje de error.
 *
 * @param client Instancia del bot (BotClient).
 * @param interaction Interacción del botón recibida.
 */
export async function handleButton(
  client: BotClient,
  interaction: ButtonInteraction
): Promise<void> {
  try {
    // Handlers especiales
    if (interaction.customId === CUSTOM_IDS.LYRICS) {
      await handleLyricsButton(interaction);
      return;
    }
    if (
      interaction.customId.startsWith('close_lyrics_') ||
      interaction.customId === 'close'
    ) {
      await closeExecute(interaction);
      return;
    }

    // Handlers registrados en el cliente
    const buttonHandler = client.buttonInteractions.get(interaction.customId);
    if (!buttonHandler) {
      console.warn(
        `[Advertencia] Manejador de botón desconocido: ${interaction.customId}`
      );
      return;
    }

    await buttonHandler.execute(interaction);
    console.log(
      `[Interacción] Botón '${interaction.customId}' presionado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al manejar el botón '${interaction.customId}':`,
      error
    );
    const replyContent = {
      content: 'Hubo un error al procesar este botón!',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyContent);
    } else {
      await interaction.reply(replyContent);
    }
  }
}
