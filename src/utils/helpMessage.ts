import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS, MUSIC_COMMANDS } from './constants';

export function createHelpMessage() {
  const embed = new EmbedBuilder()
    .setColor(0x00ae86)
    .setTitle('🎵 Comandos de Música - Ayuda Rápida')
    .setDescription(
      [
        '**Comandos disponibles:**',
        `• **Play:** \`${MUSIC_COMMANDS.PLAY}<canción>\` - Reproduce una canción`,
        `• **Stop:** \`${MUSIC_COMMANDS.STOP}\` - Detiene la música`,
        `• **Skip:** \`${MUSIC_COMMANDS.SKIP}\` - Salta la canción actual`,
        `• **Queue:** \`${MUSIC_COMMANDS.QUEUE}\` - Muestra la cola`,
        `• **Volume:** \`${MUSIC_COMMANDS.VOLUME}<1-100>\` - Ajusta el volumen`,
        '',
        '**💡 Tip:** Usa los botones de abajo para copiar los comandos fácilmente.',
      ].join('\n')
    )
    .setFooter({ text: 'Este mensaje se mantiene siempre al final del chat' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.PLAY)
      .setLabel('▶️ Play')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.STOP)
      .setLabel('⏹️ Stop')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.SKIP)
      .setLabel('⏭️ Siguiente')
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.QUEUE)
      .setLabel('📜 Lista de Reproducción')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.VOLUME)
      .setLabel('🔊 Volumen')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embed, components: [row1, row2] };
}
