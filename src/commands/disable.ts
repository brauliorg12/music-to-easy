import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import BotState from '../utils/botState';
import { CUSTOM_IDS } from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('disable')
  .setDescription('Desactiva el sistema de ayuda de música en este servidor.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  const botState = BotState.getInstance();

  try {
    // Verificar que el canal existe y es un canal de texto
    if (!interaction.channel || !interaction.channel.isTextBased()) {
      await interaction.reply({
        content: '❌ Este comando solo puede ser usado en canales de texto.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel as TextChannel;

    // Verificar si el sistema está activo
    const currentChannel = botState.getChannel();
    if (!currentChannel) {
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
    const lastMessageId = botState.getLastMessageId();
    if (lastMessageId) {
      try {
        const targetChannel = interaction.guild?.channels.cache.get(currentChannel) as TextChannel;
        if (targetChannel) {
          const lastMessage = await targetChannel.messages.fetch(lastMessageId);
          await lastMessage.delete();
          console.log(`[Disable] Mensaje de ayuda eliminado del canal #${targetChannel.name}`);
        }
      } catch (error) {
        console.log('[Disable] No se pudo eliminar el mensaje de ayuda (puede que ya haya sido eliminado)');
      }
    }

    // Limpiar el estado del bot
    const previousChannelId = currentChannel;
    const previousChannel = interaction.guild?.channels.cache.get(previousChannelId);
    const previousChannelName = previousChannel ? (previousChannel as TextChannel).name : 'canal desconocido';

    botState.clearChannel();
    botState.clearLastMessageId();

    console.log(
      `[Disable] Sistema desactivado del canal #${previousChannelName} (${previousChannelId}) por ${interaction.user.tag}`
    );

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
