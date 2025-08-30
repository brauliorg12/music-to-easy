import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import { createHelpMessage } from '../utils/helpMessage';
import { CUSTOM_IDS } from '../utils/constants';
import { writePanelState, readPanelState } from '../utils/stateManager';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Activa el panel de ayuda de música en este canal.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  // Log temporal para debug
  // console.log('[DEBUG] interaction.channel:', interaction.channel);

  let channel: TextChannel | null = null;
  if (interaction.channel && 'type' in interaction.channel) {
    channel = interaction.channel as TextChannel;
  } else if (interaction.guild && interaction.channelId) {
    // Fallback: intenta buscar el canal por ID
    const fetched = await interaction.guild.channels.fetch(interaction.channelId).catch(() => null);
    if (fetched && 'type' in fetched) {
      channel = fetched as TextChannel;
      console.log('[DEBUG] Canal obtenido por fetch:', channel);
    }
  }

  const allowedTypes = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread,
  ];

  if (
    !channel ||
    !allowedTypes.includes(channel.type)
  ) {
    await interaction.reply({
      content: '❌ Este comando solo puede ser usado en canales de texto de servidor.',
      ephemeral: true,
    });
    return;
  }

  try {
    // Leer estado anterior
    const prevState = interaction.guildId ? readPanelState(interaction.guildId) : null;
    if (prevState?.channelId && prevState.lastHelpMessageId) {
      try {
        const targetChannel = interaction.guild?.channels.cache.get(prevState.channelId);
        if (
          targetChannel &&
          typeof (targetChannel as any).messages?.fetch === 'function' &&
          typeof (targetChannel as any).send === 'function'
        ) {
          const lastMessage = await (targetChannel as TextChannel).messages.fetch(prevState.lastHelpMessageId);
          await lastMessage.delete();
          console.log(`[Music] Mensaje anterior eliminado del canal #${(targetChannel as TextChannel).name}`);
        }
      } catch {
        console.log('[Music] Mensaje anterior ya no existe o no se pudo eliminar');
      }
    }

    // Enviar mensaje inicial de ayuda
    const { embed, components } = createHelpMessage();

    await interaction.reply({
      embeds: [embed],
      components: components,
    });

    const message = await interaction.fetchReply();

    // Guardar el estado en disco
    if (interaction.guildId) {
      writePanelState({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        lastHelpMessageId: message.id,
      });
    }

    console.log(
      `[Music] Panel activado en canal #${channel.name} (${interaction.channelId}) por ${interaction.user.tag}`
    );

    // Crear embed card para el mensaje de confirmación
    const confirmationEmbed = new EmbedBuilder()
      .setColor(0x00FF7F)
      .setTitle('🎵 Panel de música activado')
      .addFields(
        { 
          name: '📍 Canal configurado', 
          value: `${channel}`, 
          inline: false 
        },
        { 
          name: '✨ Funcionalidad', 
          value: 'El panel se mantendrá siempre al final para fácil acceso', 
          inline: false 
        }
      )
      .setFooter({ text: '¡Ahora puedes usar los botones del panel!' })
      .setTimestamp();

    // Crear botón de cerrar para el mensaje de confirmación
    const closeButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CLOSE)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    // Enviar confirmación adicional con embed card
    await interaction.followUp({
      embeds: [confirmationEmbed],
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error(`[Music] Error al activar el panel:`, error);
    
    const errorMessage = '❌ Hubo un error al activar el panel de música. Inténtalo de nuevo.';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  }
}
