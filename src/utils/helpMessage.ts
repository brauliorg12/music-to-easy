import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import {
  CUSTOM_IDS,
  MUSIC_COMMANDS,
  PANEL_EMBED_TITLE,
} from './constants';
import { readAutoDetectState } from './autoDetectState';
import { getClient } from '../globalClient';

/**
 * Crea el mensaje de ayuda principal del bot de música.
 * Incluye un embed con los comandos más usados y un botón de ayuda.
 * El footer y los comandos pueden variar según si la autodetección está activa en el canal.
 *
 * @param guildId (opcional) ID del servidor para verificar autodetección.
 * @param channelId (opcional) ID del canal para verificar autodetección.
 * @param lyricsEnabled (opcional) Si el botón "Letra" debe estar habilitado.
 * @returns Un objeto con el embed y los componentes (botones) para enviar en Discord.
 */
export function createHelpMessage(
  guildId?: string,
  channelId?: string,
  lyricsEnabled?: boolean
) {
  // Determina si la autodetección está activa en este canal
  const autodetectActive =
    guildId && channelId ? readAutoDetectState(guildId, channelId) : false;

  // Si lyricsEnabled no se pasa, lo deduce del estado de actividad global
  if (lyricsEnabled === undefined) {
    const client = getClient();
    lyricsEnabled = client?.currentActivityType === 2; // 2 = LISTENING
  }

  // Crea el embed con los comandos de música
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(PANEL_EMBED_TITLE)
    .setDescription(
      'Haz click en el bloque de código que desees para copiar el comando y pégalo en el chat.\n' +
        `> Usa \`${MUSIC_COMMANDS.PLAY.trim()} <nombre o URL>\` para reproducir una canción por nombre o desde YouTube, Spotify, etc.`
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
        value: `\`\`\`\n${MUSIC_COMMANDS.PAUSE}\`\`\``,
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
        ? '✨ También puedes escribir directamente el link o nombre de la canción en este canal y el te sugerirá el comando automáticamente.'
        : '✨ Los comandos aparecen listos para copiar y pegar.',
    })
    .setTimestamp();

  // Crea la fila de botones (solo uno de ayuda por ahora)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    // Botón de Letra (habilitado solo si hay canción)
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.LYRICS)
      .setLabel('Letra')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎤')
      .setDisabled(!lyricsEnabled),
    // Botón de Ayuda
    new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.HELP)
      .setLabel('Ayuda')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('ℹ️')
  );

  // Devuelve el embed y los componentes para enviar en Discord
  return {
    embed,
    components: [row],
  };
}
