import { CommandInteraction } from 'discord.js';
import { BotClient } from '../core/BotClient';

/**
 * Maneja la ejecución de comandos de barra (slash commands) en Discord.
 * Busca el comando correspondiente y lo ejecuta.
 * Si no existe, muestra una advertencia en consola.
 * Si ocurre un error al ejecutar el comando, responde al usuario con un mensaje de error.
 *
 * @param client Instancia del bot (BotClient).
 * @param interaction Interacción del comando recibida.
 */
export async function handleCommand(
  client: BotClient,
  interaction: CommandInteraction
): Promise<void> {
  // Busca el comando registrado por nombre
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(
      `[Advertencia] Comando desconocido: ${interaction.commandName}`
    );
    await interaction.reply({
      content: '❌ Este comando no está disponible en Music to Easy.',
      ephemeral: true,
    });
    return;
  }
  try {
    // Ejecuta el comando
    await command.execute(interaction);
    console.log(
      `[Interacción] Comando '${interaction.commandName}' ejecutado por ${interaction.user.tag}.`
    );
  } catch (error) {
    console.error(
      `[ERROR] Error al ejecutar el comando '${interaction.commandName}':`,
      error
    );
    // Si ya se respondió o difirió la interacción, usa followUp, si no, reply
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
