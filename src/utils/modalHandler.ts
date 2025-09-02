import { ModalSubmitInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

/**
 * Maneja la interacción de modales personalizados en Discord.
 * Busca el manejador correspondiente al customId del modal y lo ejecuta.
 * Si no existe, muestra una advertencia en consola.
 * Si ocurre un error al ejecutar el manejador, responde al usuario con un mensaje de error.
 *
 * @param client Instancia del bot (BotClient).
 * @param interaction Interacción del modal recibida.
 */
export async function handleModal(
  client: BotClient,
  interaction: ModalSubmitInteraction
): Promise<void> {
  // Busca el manejador registrado para el customId del modal
  const modalHandler = client.modalInteractions.get(interaction.customId);
  if (!modalHandler) {
    console.warn(
      `[Advertencia] Manejador de modal desconocido: ${interaction.customId}`
    );
    return;
  }
  try {
    // Ejecuta el manejador del modal
    await modalHandler.execute(interaction);
    console.log(
      `[Interacción] Modal '${interaction.customId}' enviado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al manejar el modal '${interaction.customId}':`,
      error
    );
    // Si ya se respondió o difirió la interacción, usa followUp, si no, reply
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Hubo un error al procesar este formulario!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al procesar este formulario!',
        ephemeral: true,
      });
    }
  }
}
