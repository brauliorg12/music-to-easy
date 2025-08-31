import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';

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

  // Ignora mensajes de bots o comandos válidos
  if (message.author.bot || message.content.startsWith(prefix)) {
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
    .setTitle('🎵 Sugerencia de comando')
    .setDescription(
      [
        `Usa el comando para reproducir tu enlace o búsqueda:`,
        `\`\`\`\n${prefix} ${linkOrName}\n\`\`\``,
        '_Puedes cerrar este mensaje con el botón de abajo._',
      ].join('\n')
    )
    .setFooter({
      text: 'Music to Easy - Sugerencia automática',
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
    await message.reply({
      embeds: [embed],
      components: [row],
    });
  } catch (err) {
    // Si ocurre un error al enviar el mensaje, lo registramos en consola
    console.warn('[Advertencia] No se pudo enviar sugerencia de comando:', err);
  }
}
