import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';

export async function execute(interaction: ButtonInteraction): Promise<void> {
  try {
    // Crear embed informativo actualizado con los comandos y funcionamiento del bot
    const helpEmbed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('❓ Ayuda de Music to Easy')
      .setDescription(
        '**Controla la música fácilmente usando los botones del panel o comandos de bots de música externos.**'
      )
      .addFields(
        {
          name: '🎵 ¿Cómo usar el panel?',
          value:
            '1. Usa el comando `/music` para activar el panel de control en este canal.\n2. Haz click en los botones del panel para obtener comandos listos para copiar y pegar en el chat.\n3. El panel se mantiene siempre visible al final del canal para fácil acceso.',
          inline: false,
        },
        {
          name: '📋 ¿Qué hace este bot?',
          value:
            '• No reproduce música directamente, sino que te ayuda a usar bots de música externos (como MEE6, Rythm, FredBoat, etc.) de forma más sencilla.\n• Los botones generan comandos como `m!p <canción>` para que los pegues en el chat y el bot de música correspondiente los ejecute.',
          inline: false,
        },
        {
          name: 'ℹ️ Comandos propios',
          value:
            '• `/music` - Activa el panel de control de música en el canal actual.\n• `/disable` - Desactiva y elimina el panel de música del canal actual.',
          inline: false,
        }
      )
      .setFooter({
        text: 'Music to Easy - Controla la música sin complicaciones',
      })
      .setTimestamp();

    // Crear botón de cerrar
    const closeButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CLOSE)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      closeButton
    );

    await interaction.reply({
      embeds: [helpEmbed],
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error('[Help] Error al mostrar ayuda:', error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Hubo un error al mostrar la ayuda.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al mostrar la ayuda.',
        ephemeral: true,
      });
    }
  }
}
