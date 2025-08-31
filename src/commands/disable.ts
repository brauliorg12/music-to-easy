import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';
import { getStateFilePath, readPanelState } from '../utils/stateManager';
import fs from 'fs';
import path from 'path';

export const data = new SlashCommandBuilder()
  .setName('disable')
  .setDescription('Desactiva el sistema de ayuda de música en este servidor.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  try {
    // Verificar que el canal existe y es un canal de texto de servidor
    if (
      !interaction.channel ||
      ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(interaction.channel.type)
    ) {
      await interaction.reply({
        content: '❌ Este comando solo puede ser usado en canales de texto de servidor.',
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: '❌ No se pudo identificar el servidor.',
        ephemeral: true,
      });
      return;
    }

    // Leer el estado del panel para este servidor
    const state = readPanelState(guildId);

    if (!state?.channelId) {
      const closeButton = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.CLOSE)
        .setLabel('Cerrar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

      await interaction.reply({
        content: '⚠️ **El sistema no está activo**\nNo hay ningún canal configurado para desactivar.',
        components: [row],
        ephemeral: true,
      });
      return;
    }

    // Intentar eliminar el último mensaje de ayuda si existe
    if (state.lastHelpMessageId) {
      try {
        const targetChannel = interaction.guild?.channels.cache.get(state.channelId) as TextChannel;
        if (targetChannel) {
          const lastMessage = await targetChannel.messages.fetch(state.lastHelpMessageId);
          await lastMessage.delete();
          console.log(`[Disable] Mensaje de ayuda eliminado del canal #${targetChannel.name}`);
        }
      } catch (error) {
        console.log('[Disable] No se pudo eliminar el mensaje de ayuda (puede que ya haya sido eliminado)');
      }
    }

    // Elimina el archivo de autodetect para este canal si existe
    const autodetectFile = path.join(
      __dirname,
      '../../db',
      `autodetect-${guildId}-${state.channelId}.json`
    );
    if (fs.existsSync(autodetectFile)) {
      fs.unlinkSync(autodetectFile);
      console.log(`[DB] Archivo de autodetect eliminado para canal ${state.channelId}`);
    }

    // Elimina el archivo de estado del servidor
    const stateFile = getStateFilePath(guildId);
    if (fs.existsSync(stateFile)) {
      fs.unlinkSync(stateFile);
      console.log(`[DB] Archivo de estado eliminado para guild ${guildId}`);
    }

    const previousChannel = interaction.guild?.channels.cache.get(state.channelId);
    const previousChannelName = previousChannel ? (previousChannel as TextChannel).name : 'canal desconocido';

    // Crear botón de cerrar para el mensaje de confirmación
    const closeButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CLOSE)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    // Enviar confirmación
    await interaction.reply({
      content: `🔴 **Sistema Music to Easy desactivado**\n📍 Canal anterior: #${previousChannelName}\n⚪ El bot ya no responderá automáticamente en ningún canal.`,
      components: [row],
      ephemeral: true,
    });

  } catch (error) {
    console.error(`[Disable] Error al desactivar el sistema:`, error);

    const errorMessage = '❌ Hubo un error al desactivar el sistema. Inténtalo de nuevo.';

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
