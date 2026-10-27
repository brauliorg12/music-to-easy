import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import {
  CUSTOM_IDS,
  SUGGESTION_EMBED_TITLE,
  SUGGESTION_TIMEOUT_SECONDS,
} from '../utils/constants';
import { readAutoDetectState } from './autoDetectState';
import { readPanelState } from './stateManager';

// Expresiones regulares para detectar links de YouTube y Spotify desde variables de entorno
const youtubeRegex = new RegExp(process.env.YOUTUBE_REGEX ?? '', 'i');
const spotifyRegex = new RegExp(process.env.SPOTIFY_REGEX ?? '', 'i');

/**
 * Verifica si el contenido del mensaje es un link de música soportado.
 * @param content Contenido del mensaje a analizar.
 * @returns true si es un link de YouTube o Spotify, false en caso contrario.
 */
export function isMusicLink(content: string): boolean {
  return youtubeRegex.test(content) || spotifyRegex.test(content);
}

/**
 * Verifica si el mensaje es una búsqueda de canción (texto normal, no comando ni link).
 * @param content Contenido del mensaje a analizar.
 * @returns true si parece una búsqueda de canción.
 */
export function isSongQuery(content: string): boolean {
  // No es comando, no es link, tiene letras y/o espacios, longitud mínima
  return (
    !isMusicLink(content) &&
    !content.startsWith('m!p') &&
    /^[\w\s\-\(\)\[\]\'\"]{3,}$/i.test(content.trim())
  );
}

/**
 * Si el mensaje contiene un link de música o parece una búsqueda, sugiere el comando correcto al usuario,
 * agregando un botón para cerrar el mensaje.
 * @param message Mensaje recibido en Discord.
 */
export async function handleMusicLinkSuggestion(
  message: Message
): Promise<void> {
  const prefix = 'm!p';

  // Ignora mensajes de bots o comandos válidos (case-insensitive)
  if (
    message.author.bot ||
    message.content.trim().toLowerCase().startsWith(prefix)
  ) {
    return;
  }

  // Solo sugerir si está activado en el canal y el panel está activo en ese canal
  if (
    !message.guildId ||
    !message.channelId ||
    !readAutoDetectState(message.guildId, message.channelId)
  ) {
    return;
  }

  // Verifica que el panel esté activo en este canal
  const panelState = readPanelState(message.guildId);
  if (!panelState || panelState.channelId !== message.channelId) {
    return;
  }

  const content = message.content.trim();

  // Solo sugerir si es link de música o búsqueda de canción
  if (!isMusicLink(content) && !isSongQuery(content)) {
    return;
  }

  const linkOrName = content;

  // Crear embed de sugerencia
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(SUGGESTION_EMBED_TITLE)
    .setDescription(
      [
        `Usa el comando para ▶️ reproducir tu enlace o búsqueda:`,
        `\`\`\`\n${prefix} ${linkOrName}\n\`\`\``,
        '_Puedes cerrar este mensaje con el botón de abajo._',
      ].join('\n')
    )
    .setFooter({
      text: `Este mensaje se autodestruirá en ${SUGGESTION_TIMEOUT_SECONDS} segundos o puedes cerrarlo manualmente.`,
    })
    .setTimestamp();

  // Crear botón de cerrar
  const closeButton = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.CLOSE)
    .setLabel('Cerrar')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('❌');

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

  try {
    const sent = await message.reply({
      embeds: [embed],
      components: [row],
      allowedMentions: { repliedUser: false },
    });

    // Marca el mensaje internamente con el tag (sin mostrarlo al usuario)
    await sent.edit({
      embeds: [
        embed.setFooter({
          text: `Este mensaje se autodestruirá en ${SUGGESTION_TIMEOUT_SECONDS} segundos o puedes cerrarlo manualmente.`,
        }),
      ],
      components: [row],
    });

    // Auto-cierre tras SUGGESTION_TIMEOUT_SECONDS segundos si no fue cerrado manualmente
    setTimeout(async () => {
      try {
        const fetched = await sent.channel.messages
          .fetch(sent.id)
          .catch(() => null);
        // Verifica que el mensaje siga siendo una sugerencia (por título y autor)
        if (
          fetched &&
          fetched.author.id === message.client.user?.id &&
          fetched.embeds[0]?.title === SUGGESTION_EMBED_TITLE
        ) {
          await fetched.delete();
        }
      } catch {}
    }, SUGGESTION_TIMEOUT_SECONDS * 1000);
  } catch (err) {
    // Si ocurre un error al enviar el mensaje, lo registramos en consola
    console.warn('[Advertencia] No se pudo enviar sugerencia de comando:', err);
  }
}
