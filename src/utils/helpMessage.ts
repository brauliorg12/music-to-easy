import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS } from './constants';

export function createHelpMessage() {
  const embed = new EmbedBuilder()
    .setColor(0x00ae86)
    .setTitle('🎵 Comandos de Música - Ayuda Rápida')
    .setDescription(
      '**Haz click en un botón para obtener el comando listo para usar:**'
    )
    .setFooter({
      text: '💡 Los comandos aparecerán listos para copiar y pegar',
    })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.PLAY)
      .setLabel(' ')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('▶️'),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.STOP)
      .setLabel(' ')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⏹️'),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.SKIP)
      .setLabel(' ')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⏭️')
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.QUEUE)
      .setLabel('Cola')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📜'),
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.HELP)
      .setLabel('Ayuda')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❓')
  );

  return {
    embed,
    components: [row1, row2],
  };
}
