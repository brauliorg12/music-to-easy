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
import { isJockieBotId } from '../utils/jockieIds';

/**
 * Definición del comando `/music`.
 */
export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Activa el panel de ayuda de música en este canal.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * Activa el panel de música en el canal actual y publica la confirmación efímera.
 * @param interaction Interacción del comando `/music`.
 */
export async function execute(interaction: CommandInteraction) {
  let channel: TextChannel | null = null;
  if (interaction.channel && 'type' in interaction.channel) {
    channel = interaction.channel as TextChannel;
  } else if (interaction.guild && interaction.channelId) {
    // Fallback: intenta buscar el canal por ID
    const fetched = await interaction.guild.channels
      .fetch(interaction.channelId)
      .catch(() => null);
    if (fetched && 'type' in fetched) {
      channel = fetched as TextChannel;
    }
  }

  const allowedTypes = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread,
  ];

  if (!channel || !allowedTypes.includes(channel.type)) {
    await interaction.reply({
      content:
        '❌ Este comando solo puede ser usado en canales de texto de servidor.',
      ephemeral: true,
    });
    return;
  }

  try {
    await interaction.deferReply();

    // Leer estado anterior
    const prevState = interaction.guildId
      ? readPanelState(interaction.guildId)
      : null;
    if (prevState?.channelId && prevState.lastHelpMessageId) {
      try {
        const targetChannel = interaction.guild?.channels.cache.get(
          prevState.channelId
        );
        if (
          targetChannel &&
          typeof (targetChannel as any).messages?.fetch === 'function' &&
          typeof (targetChannel as any).send === 'function'
        ) {
          const lastMessage = await (
            targetChannel as TextChannel
          ).messages.fetch(prevState.lastHelpMessageId).catch(() => null);
          if (lastMessage) {
            await lastMessage.delete();
            console.log(
              `[Music] Mensaje anterior eliminado del canal #${
                (targetChannel as TextChannel).name
              }`
            );
          } else {
            console.log('[Music] Mensaje anterior ya no existe o no se pudo eliminar');
          }
        }
      } catch {
        console.log(
          '[Music] Mensaje anterior ya no existe o no se pudo eliminar'
        );
      }
    }

    // Detectar si hay una canción activa (embed de "Ahora suena" del bot de música)
    let lyricsEnabled = false;
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const nowPlayingMsg = messages.find(
        (msg) =>
          isJockieBotId(msg.author.id) &&
          msg.embeds.length > 0 &&
          (msg.embeds[0].title?.toLowerCase().includes('ahora suena') ||
            msg.embeds[0].title?.toLowerCase().includes('now playing'))
      );
      lyricsEnabled = !!nowPlayingMsg;
    }

    // Enviar mensaje inicial de ayuda
    const { embed, components } = createHelpMessage(
      interaction.guildId ?? undefined,
      interaction.channelId ?? undefined,
      lyricsEnabled
    );

    const message = await interaction.editReply({
      embeds: [embed],
      components,
    });

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
      .setColor(0x00ff7f)
      .setTitle('🎵 Panel de música activado')
      .addFields(
        {
          name: '📍 Canal configurado',
          value: `${channel}`,
          inline: false,
        },
        {
          name: '✨ Funcionalidad',
          value: 'El panel se mantendrá siempre al final para fácil acceso',
          inline: false,
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      closeButton
    );

    // Enviar confirmación adicional con embed card
    await interaction.followUp({
      embeds: [confirmationEmbed],
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error(`[Music] Error al activar el panel:`, error);

    const errorMessage =
      '❌ Hubo un error al activar el panel de música. Inténtalo de nuevo.';

    if (interaction.replied || interaction.deferred) {
      let deleted = false;
      try {
        await interaction.deleteReply();
        deleted = true;
      } catch {}
      if (deleted) {
        await interaction
          .followUp({ content: errorMessage, ephemeral: true })
          .catch(() => {});
      } else {
        await interaction.editReply({ content: errorMessage }).catch(() => {});
      }
      return;
    }

    await interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
}
