import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { createHelpMessage } from '../utils/helpMessage';
import BotState from '../utils/botState';
import { CUSTOM_IDS } from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Activa el sistema de ayuda de música en este canal.')
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

    // Limpiar mensaje anterior si existe
    const currentChannel = botState.getChannel();
    if (currentChannel) {
      const lastMessageId = botState.getLastMessageId();
      if (lastMessageId) {
        try {
          const targetChannel = interaction.guild?.channels.cache.get(currentChannel) as TextChannel;
          if (targetChannel) {
            const lastMessage = await targetChannel.messages.fetch(lastMessageId);
            await lastMessage.delete();
            console.log(`[Setup] Mensaje anterior eliminado del canal #${targetChannel.name}`);
          }
        } catch (error) {
          console.log('[Setup] Mensaje anterior ya no existe o no se pudo eliminar');
        }
      }
    }

    // Guardar el ID del canal en el estado del bot
    botState.setChannel(interaction.channelId);

    // Enviar mensaje inicial de ayuda
    const { embed, components } = createHelpMessage();

    // Responder a la interacción (este será el mensaje principal)
    await interaction.reply({
      embeds: [embed],
      components: components,
    });

    // Obtener el mensaje para guardar su ID
    const message = await interaction.fetchReply();
    botState.setLastMessageId(message.id);

    console.log(
      `[Setup] Sistema activado en canal #${channel.name} (${interaction.channelId}) por ${interaction.user.tag}`
    );

    // Crear botón de cerrar para el mensaje de confirmación
    const closeButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CLOSE)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    // Enviar confirmación adicional con botón de cerrar
    await interaction.followUp({
      content: `✅ **Sistema Music to Easy activado**\n📍 Canal configurado: ${channel}\n🎵 El bot ahora reposicionará automáticamente el panel cuando aparezcan nuevos mensajes.`,
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error(`[Setup] Error al activar el sistema:`, error);
    
    const errorMessage = '❌ Hubo un error al activar el sistema. Inténtalo de nuevo.';
    
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
