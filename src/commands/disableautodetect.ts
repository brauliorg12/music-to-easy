import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';
import { writeAutoDetectState } from '../utils/autoDetectState';

const SUGGESTION_TITLE = '🎵 Sugerencia de comando';

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

  // Limpia sugerencias efímeras en el canal actual
  try {
    const channel = interaction.channel as TextChannel;
    const messages = await channel.messages.fetch({ limit: 50 });
    const suggestionMessages = messages.filter(
      m =>
        m.author.id === interaction.client.user?.id &&
        m.embeds[0]?.title === SUGGESTION_TITLE
    );
    for (const msg of suggestionMessages.values()) {
      await msg.delete().catch(() => {});
    }
  } catch {
    // No es crítico si falla
  }

  await interaction.reply({
    content: '❌ La sugerencia automática de comandos ha sido **desactivada** en este canal y las sugerencias activas han sido eliminadas.',
    ephemeral: true,
  });
}
