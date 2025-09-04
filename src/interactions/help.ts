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
          'Este bot te ayuda a usar otros bots de música (Jockie, [Mee6, FredBoat, etc. en desarrollo]) de forma más sencilla:',
          '• Crea un panel persistente que se mantiene siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan',
          '• El panel muestra los comandos más usados listos para copiar y pegar en el chat.',
          '',
          '👉 **El panel NO ejecuta comandos automáticamente, solo los muestra para que los copies y pegues tú mismo.**',
          '',
          '🎵 **¿Cómo usar el panel?**',
          '1. Un administrador ejecuta `/music` en el canal deseado y opcionalmente puede ejecutar `/autodetect` para activar las sugerencias directas',
          '2. Usa los comandos del panel para copiar y pegar.',
          '3. Pega el comando en el chat del bot de música que esté configurado.',
          '',
          '🎤 **Botón "Letra":**',
          '- Si hay una canción sonando el panel habilitará el botón "Letra".',
          '- Al pulsar el botón, el bot buscará la letra de la canción y la publicará en el canal.',
          '- Puedes cerrar todos los mensajes de la letra usando el único botón "Cerrar" que aparece al final.',
          '',
          '✨ **Sugerencia automática de comandos:**',
          '- Si envías un link de YouTube o Spotify, o simplemente escribes el nombre de una canción en el chat, el bot te sugerirá automáticamente el comando `m!p` correspondiente listo para copiar y pegar.',
          '- Solo tú verás la sugerencia y podrás cerrarla con el botón "Cerrar".',
          `- Las sugerencias se autodestruyen automáticamente a los 60 segundos si no las cierras.`,
          '- Si un administrador ejecuta `/disableautodetect`, todas las sugerencias activas del canal se eliminan inmediatamente  se desactivan.',
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
          '• `/autodetect` - Activa la sugerencia automática de comandos por links o nombres de canciones en el canal actual (requiere panel activo).',
          '• `/disableautodetect` - Desactiva la sugerencia automática en el canal actual y elimina todas las sugerencias activas.',
        ].join('\n')
      )
      .setFooter({
        text: 'Music to Easy - Controla la música facilmente',
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
