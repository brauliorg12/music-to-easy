import { TextChannel, Message, Collection } from 'discord.js';
import { isJockieBotId } from './jockieIds';

/**
 * Información de la canción detectada en un anuncio de Jockie Music.
 */
export interface JockieSongInfo {
  /** Título de la canción. */
  song: string;
  /** Primer artista detectado. */
  artist: string;
  /** Lista completa de artistas detectados. */
  artists: string[];
}

/**
 * Extrae el título y los artistas del embed de Jockie Music.
 * @param embedDesc Descripción del embed de Jockie Music.
 * @returns La canción detectada o `null` si no se puede extraer.
 */
export function parseJockieSongFromEmbed(
  embedDesc: string
): JockieSongInfo | null {
  // Soporta [**Song** **by** **Artist**] y variantes con espacios
  const mdMatch = embedDesc.match(
    /\[\*\*(.+?)\*\*\s*\*\*by\*\*\s*\*\*(.+?)\*\*\]/i
  );
  if (mdMatch) {
    const artistsArr = mdMatch[2]
      .split(/,| feat\. | & | y /i)
      .map((a) => a.trim())
      .filter(Boolean);
    return {
      song: mdMatch[1].trim(),
      artist: artistsArr[0] || '',
      artists: artistsArr,
    };
  }
  const match = embedDesc.match(/started playing (.+?) by (.+?)(?:\]|\n|$)/i);
  if (match) {
    const artistsArr = match[2]
      .split(/,| feat\. | & | y /i)
      .map((a) => a.trim())
      .filter(Boolean);
    return {
      song: match[1].replace(/\[|\]/g, '').trim(),
      artist: artistsArr[0] || '',
      artists: artistsArr,
    };
  }
  return null;
}

/**
 * Busca el mensaje más reciente relevante de Jockie Music en el canal.
 * Primero verifica si el bot de Jockie está en un canal de voz.
 * @param channel Canal de texto donde buscar el anuncio de reproducción.
 * @returns La canción en reproducción o `null` si no hay música activa.
 */
export async function findJockieNowPlayingSong(
  channel: TextChannel
): Promise<JockieSongInfo | null> {
  const guild = channel.guild;

  // 1. Comprobación crítica: ¿Está el bot de música en un canal de voz?
  const isJockieInVoice = guild.members.cache.some(
    (member) => isJockieBotId(member.id) && member.voice.channel
  );

  if (!isJockieInVoice) {
    // Si no está en un canal de voz, es imposible que esté sonando música.
    return null;
  }

  // 2. Si está en un canal de voz, busca el mensaje de "Ahora suena".
  let lastId: string | undefined = undefined;
  for (let i = 0; i < 4; i++) {
    const messages: Collection<
      string,
      Message<true>
    > = await channel.messages.fetch({
      limit: 50,
      ...(lastId ? { before: lastId } : {}),
    });
    if (!messages.size) break;
    const sorted = messages
      .filter(
        (msg) =>
          isJockieBotId(msg.author.id) &&
          msg.embeds.length > 0 &&
          msg.embeds[0].description
      )
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    for (const msg of sorted.values()) {
      const desc = msg.embeds[0].description!;
      if (/there are no more tracks|no tracks have been playing/i.test(desc)) {
        return null;
      }
      if (/started playing/i.test(desc)) {
        const parsed = parseJockieSongFromEmbed(desc);
        if (parsed) {
          return parsed;
        }
        // Último recurso: limpia emojis y markdown
        const song = desc
          .replace(/<:[^>]+>|\*\*|\[|\]|\(.*?\)|Started playing|by/gi, '')
          .trim();
        return {
          song,
          artist: '',
          artists: [],
        };
      }
    }
    lastId = messages.last()?.id;
  }
  return null;
}
