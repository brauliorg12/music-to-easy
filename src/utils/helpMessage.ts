import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CUSTOM_IDS } from './constants';

export function createHelpMessage() {
  const embed = new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle('🎵 Music to Easy')
    .setDescription('**Haz click en un botón para obtener el comando listo para usar:**')
    .addFields(
      { name: '▶️ Reproducir', value: 'Reproduce música desde YouTube, Spotify, etc.', inline: false },
      { name: '⏹️ Detener', value: 'Detiene la música y desconecta el bot', inline: false },
      { name: '⏭️ Saltar', value: 'Salta a la siguiente canción en la cola', inline: false },
      { name: '📜 Cola', value: 'Muestra la cola de reproducción actual', inline: false },
      { name: '🔊 Volumen', value: 'Ajusta el volumen de la música (1-100)', inline: false }
    )
    .setFooter({ text: '💡 Los comandos aparecerán listos para copiar y pegar' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.PLAY)
        .setLabel('Reproducir')
        .setStyle(ButtonStyle.Success)
        .setEmoji('▶️'),
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.STOP)
        .setLabel('Detener')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⏹️'),
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.SKIP)
        .setLabel('Saltar')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⏭️')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.QUEUE)
        .setLabel('Cola')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📜'),
      new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.VOLUME)
        .setLabel('Volumen')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔊')
    );

  return {
    embed,
    components: [row1, row2]
  };
}
