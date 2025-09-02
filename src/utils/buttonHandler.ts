import { ButtonInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

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
  // Busca el manejador registrado para el customId del botón
  const buttonHandler = client.buttonInteractions.get(interaction.customId);
  if (!buttonHandler) {
    console.warn(
      `[Advertencia] Manejador de botón desconocido: ${interaction.customId}`
    );
    return;
  }
  try {
    // Ejecuta el manejador del botón
    await buttonHandler.execute(interaction);
    console.log(
      `[Interacción] Botón '${interaction.customId}' presionado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al manejar el botón '${interaction.customId}':`,
      error
    );
    // Si ya se respondió o difirió la interacción, usa followUp, si no, reply
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
