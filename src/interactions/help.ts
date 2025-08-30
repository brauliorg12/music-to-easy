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
          '• Crea un panel persistente en el canal que elijas.',
          '• El panel muestra los comandos más usados listos para copiar y pegar en el chat del bot de música que prefieras.',
          '• El panel se mantiene siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan.',
          '',
          '👉 **El panel NO ejecuta comandos automáticamente, solo los muestra para que los copies y pegues tú mismo.**',
          '',
          '🎵 **¿Cómo usar el panel?**',
          '1. Un administrador ejecuta `/music` en el canal deseado.',
          '2. Usa los comandos del panel para copiar y pegar.',
          '3. Pega el comando en el chat del bot de música de tu preferencia.',
          '',
          '🔗 **Sobre el comando `m!p` (Play):**',
          '- Puedes escribir `m!p <nombre de la canción>` para buscar y reproducir una canción por nombre.',
          '- O puedes usar `m!p <URL>` para reproducir directamente desde YouTube, Spotify, SoundCloud, etc.',
          '- Ejemplos:',
          '  - `m!p Shape of You`',
          '  - `m!p https://www.youtube.com/watch?v=JGwWNGJdvx8`',
          '  - `m!p https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3`',
          '',
          'ℹ️ **Comandos propios**',
          '• `/music` - Activa el panel de control de música en el canal actual.',
          '• `/disable` - Desactiva y elimina el panel de música del canal actual.',
        ].join('\n')
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
