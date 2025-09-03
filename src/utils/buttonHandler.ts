import { ButtonInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';
import { CUSTOM_IDS } from './constants';
import { handleLyricsButton } from '../lyrics/LyricsManager';
import { execute as closeExecute } from '../interactions/close';

/**
 * Maneja la interacción de botones personalizados en Discord.
 * Busca el manejador correspondiente al customId del botón y lo ejecuta.
 * Si no existe, muestra una advertencia en consola.
 * Si ocurre un error al ejecutar el manejador, responde al usuario con un mensaje de error.
 *
 * @param client Instancia del bot (BotClient).
 * @param interaction Interacción del botón recibida.
 */
export async function handleButton(
  client: BotClient,
  interaction: ButtonInteraction
): Promise<void> {
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
  const buttonHandler = client.buttonInteractions.get(interaction.customId);
  if (!buttonHandler) {
    console.warn(
      `[Advertencia] Manejador de botón desconocido: ${interaction.customId}`
    );
    return;
  }
  try {
    await buttonHandler.execute(interaction);
    console.log(
      `[Interacción] Botón '${interaction.customId}' presionado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al manejar el botón '${interaction.customId}':`,
      error
    );
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Hubo un error al procesar este botón!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al procesar este botón!',
        ephemeral: true,
      });
    }
  }
}
