import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { writeAutoDetectState } from '../utils/autoDetectState';

export const data = new SlashCommandBuilder()
  .setName('disableautodetect')
  .setDescription('Desactiva la sugerencia automática de comandos por links o nombres de canciones en este canal.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guildId;
  const channelId = interaction.channelId;
  if (!guildId || !channelId) {
    await interaction.reply({
      content: 'Este comando solo puede usarse en canales de servidores.',
      ephemeral: true,
    });
    return;
  }
  writeAutoDetectState(guildId, channelId, false);
  await interaction.reply({
    content: '❌ La sugerencia automática de comandos ha sido **desactivada** en este canal.',
    ephemeral: true,
  });
}
