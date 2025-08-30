import { CommandInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

export async function handleCommand(
  client: BotClient,
  interaction: CommandInteraction
): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(
      `[Advertencia] Comando desconocido: ${interaction.commandName}`
    );
    return;
  }
  try {
    await command.execute(interaction);
    console.log(
      `[Interacción] Comando '${interaction.commandName}' ejecutado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al ejecutar el comando '${interaction.commandName}':`,
      error
    );
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Hubo un error al ejecutar este comando!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al ejecutar este comando!',
        ephemeral: true,
      });
    }
  }
}
