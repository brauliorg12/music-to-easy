import { TextChannel, Message, Collection } from 'discord.js';
import { setBotActivity } from './jockiePanelActions';

function getJockieBotIds(): string[] {
  return (process.env.JOCKIE_MUSIC_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Extrae título y artista(s) del embed de Jockie Music.
 * Devuelve { song, artist, artists } o null si no se puede extraer.
 */
export function parseJockieSongFromEmbed(
  embedDesc: string
): { song: string; artist: string; artists: string[] } | null {
  // Soporta [**Song** **by** **Artist**] y variantes con espacios
  const mdMatch = embedDesc.match(
    /\[\*\*(.+?)\*\*\s*\*\*by\*\*\s*\*\*(.+?)\*\*\]/i
  );
  if (mdMatch) {
    const artistsArr = mdMatch[2].split(/,| feat\. | & | y /i).map(a => a.trim()).filter(Boolean);
    return { song: mdMatch[1].trim(), artist: artistsArr[0] || '', artists: artistsArr };
  }
  const match = embedDesc.match(/started playing (.+?) by (.+?)(?:\]|\n|$)/i);
  if (match) {
    const artistsArr = match[2].split(/,| feat\. | & | y /i).map(a => a.trim()).filter(Boolean);
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
 * Si es "Started playing ..." devuelve { song, artist, artists }, si es "There are no more tracks" o similar, devuelve null.
 */
export async function findJockieNowPlayingSong(
  channel: TextChannel
): Promise<{ song: string; artist: string; artists: string[] } | null> {
  const musicBotIds = getJockieBotIds();
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
          musicBotIds.includes(msg.author.id) &&
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

/**
 * Sincroniza la actividad del bot (Listening) según el mensaje de "Started playing ..." de Jockie Music en el canal.
 */
export async function syncBotActivity(channel: TextChannel) {
  const nowPlaying = await findJockieNowPlayingSong(channel);
  if (nowPlaying) {
    const { song, artist } = nowPlaying;
    setBotActivity(`▶️ - ${song}${artist ? ` by ${artist}` : ''}`, 2);
    console.log(
      `[ActivitySync] setBotActivity: ▶️ - ${song}${
        artist ? ` by ${artist}` : ''
      }`
    );
  } else {
    setBotActivity('🤖 Bot de ayuda de comandos de música', 3);
    console.log(
      '[ActivitySync] setBotActivity: WATCHING (no hay música activa)'
    );
  }
}
