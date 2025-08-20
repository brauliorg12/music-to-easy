import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { createHelpMessage } from '../utils/helpMessage';
import BotState from '../utils/botState';
import { CUSTOM_IDS } from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Activa el panel de ayuda de música en este canal.')
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
            console.log(`[Music] Mensaje anterior eliminado del canal #${targetChannel.name}`);
          }
        } catch (error) {
          console.log('[Music] Mensaje anterior ya no existe o no se pudo eliminar');
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
