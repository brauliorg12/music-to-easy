import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CUSTOM_IDS, MUSIC_COMMANDS } from './constants';
import { readAutoDetectState } from './autoDetectState';

export function createHelpMessage(guildId?: string, channelId?: string) {
  const autodetectActive =
    guildId && channelId
      ? readAutoDetectState(guildId, channelId)
      : false;

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🎵 Comandos de Música')
    .setDescription(
      'Haz click en el bloque de código para copiar el comando y pégalo en el chat del bot de música.\n' +
        '> Usa `m!p <nombre o URL>` para reproducir una canción por nombre o desde YouTube, Spotify, etc.'
    )
    // Primera fila: Play, Pause y Stop
    .addFields(
      {
        name: '▶️ Play',
        value: `\`\`\`${MUSIC_COMMANDS.PLAY}\`\`\``,
        inline: true,
      },
      {
        name: '⏸️ Pausa',
        value: '```\nm!pause```',
        inline: true,
      },
      {
        name: '⏹️ Stop',
        value: `\`\`\`${MUSIC_COMMANDS.STOP}\`\`\``,
        inline: true,
      }
    )
    // Segunda fila: Siguiente y Listado
    .addFields(
      {
        name: '⏭️ Siguiente',
        value: `\`\`\`${MUSIC_COMMANDS.SKIP}\`\`\``,
        inline: true,
      },
      {
        name: '📜 Listado',
        value: `\`\`\`${MUSIC_COMMANDS.QUEUE}\`\`\``,
        inline: true,
      }
    )
    .setFooter({
      text: autodetectActive
        ? '💡 También puedes escribir directamente el link o nombre de la canción en este canal y el bot te sugerirá el comando automáticamente.'
        : '💡 Los comandos aparecen listos para copiar y pegar.',
    })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.HELP)
      .setLabel('Ayuda')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❓')
  );

  return {
    embed,
    components: [row],
  };
}
