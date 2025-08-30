import { ButtonInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

export async function handleButton(
  client: BotClient,
  interaction: ButtonInteraction
): Promise<void> {
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
