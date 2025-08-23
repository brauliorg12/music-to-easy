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
    const helpEmbed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('❓ Ayuda de Music to Easy')
      .setDescription(
        [
          'Music to Easy **no reproduce música ni se conecta a canales de voz**.',
          '',
          'Este bot te ayuda a usar otros bots de música (Mee6, FredBoat, Jockie, etc.) de forma más sencilla:',
          '• Crea un panel de botones persistente en el canal que elijas.',
          '• Al pulsar un botón, te muestra el comando listo para copiar y pegar en el chat del bot de música que prefieras.',
          '• El panel se mantiene siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan.',
          '',
          '👉 **Los botones NO ejecutan comandos automáticamente, solo los muestran para que los copies y pegues tú mismo.**'
        ].join('\n')
      )
      .addFields(
        {
          name: '🎵 ¿Cómo usar el panel?',
          value:
            '1. Un administrador ejecuta `/music` en el canal deseado.\n2. Usa los botones del panel para obtener comandos listos para copiar.\n3. Pega el comando en el chat del bot de música de tu preferencia.',
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
        text: 'Music to Easy - Controla la música sin complicaciones (usando otros bots)',
      })
      .setTimestamp();

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
