import { ModalSubmitInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

export async function handleModal(
  client: BotClient,
  interaction: ModalSubmitInteraction
): Promise<void> {
  const modalHandler = client.modalInteractions.get(interaction.customId);
  if (!modalHandler) {
    console.warn(
      `[Advertencia] Manejador de modal desconocido: ${interaction.customId}`
    );
    return;
  }
  try {
    await modalHandler.execute(interaction);
    console.log(
      `[Interacción] Modal '${interaction.customId}' enviado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al manejar el modal '${interaction.customId}':`,
      error
    );
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
