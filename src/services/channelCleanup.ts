import { Message, SnowflakeUtil, TextChannel } from 'discord.js';
import {
  lyricsMessageMap,
  lyricsActiveGroupByChannel,
} from '../utils/lyricsMessageMap';
import { LYRICS_EMBED_FOOTER_PREFIX } from '../lyrics/lyricsConstants';
import {
  LYRICS_CONFIRMATION_EMBED_TITLE,
  NOW_PLAYING_EMBED_TITLE,
  PANEL_EMBED_TITLE_MATCH,
} from '../utils/constants';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_BULK_DELETE = 100;

/**
 * Indica si un mensaje es un panel de comandos enviado por el bot.
 * @param message Mensaje a evaluar.
 * @param clientUserId ID del usuario del bot.
 * @returns `true` si el mensaje es un panel de comandos.
 */
export function isPanelEmbedMessage(
  message: Message,
  clientUserId: string
): boolean {
  if (message.author.id !== clientUserId) return false;
  const embed = message.embeds[0];
  return !!embed?.title?.includes(PANEL_EMBED_TITLE_MATCH);
}

/**
 * Indica si un mensaje es el embed "¡Ahora suena!" enviado por el bot.
 * @param message Mensaje a evaluar.
 * @param clientUserId ID del usuario del bot.
 * @returns `true` si el mensaje es el embed de reproducción actual.
 */
export function isNowPlayingEmbedMessage(
  message: Message,
  clientUserId: string
): boolean {
  if (message.author.id !== clientUserId) return false;
  return message.embeds[0]?.title === NOW_PLAYING_EMBED_TITLE;
}

/**
 * Indica si un mensaje es un embed de letras o su confirmación, enviado por el bot.
 * @param message Mensaje a evaluar.
 * @param clientUserId ID del usuario del bot.
 * @returns `true` si el mensaje pertenece al flujo de letras.
 */
export function isLyricsEmbedMessage(
  message: Message,
  clientUserId: string
): boolean {
  if (message.author.id !== clientUserId) return false;
  const embed = message.embeds[0];
  if (!embed) return false;
  const hasLyricsFooter =
    embed.footer?.text?.includes(LYRICS_EMBED_FOOTER_PREFIX) ?? false;
  const isConfirmationEmbed = embed.title === LYRICS_CONFIRMATION_EMBED_TITLE;
  return hasLyricsFooter || isConfirmationEmbed;
}

/**
 * Opciones de limpieza de mensajes gestionados por el bot.
 */
export interface PurgeManagedMessagesOptions {
  /** ID del usuario del bot, para exigir que los mensajes sean propios. */
  clientUserId: string;
  /** Limpiar paneles de comandos. */
  panel?: boolean;
  /** Limpiar embeds de "¡Ahora suena!". */
  nowPlaying?: boolean;
  /** Limpiar embeds de letras y sus confirmaciones. */
  lyrics?: boolean;
}

/**
 * Borra en una sola lectura los mensajes gestionados por el bot que correspondan
 * a las categorías solicitadas. Los mensajes recientes se borran en lotes y los
 * antiguos se borran individualmente.
 * @param channel Canal de texto donde se limpiarán los mensajes.
 * @param options Categorías habilitadas e ID del usuario del bot.
 */
export async function purgeManagedMessages(
  channel: TextChannel,
  options: PurgeManagedMessagesOptions
): Promise<void> {
  const { clientUserId, panel = false, nowPlaying = false, lyrics = false } =
    options;
  const targetIds = new Set<string>();
  const fetchedMessages = new Map<string, Message>();
  let fetchedCount = 0;
  let fetchFailed = false;

  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    fetchedCount = messages.size;
    for (const message of messages.values()) {
      fetchedMessages.set(message.id, message);
      const matchesCategory =
        (panel && isPanelEmbedMessage(message, clientUserId)) ||
        (nowPlaying && isNowPlayingEmbedMessage(message, clientUserId)) ||
        (lyrics && isLyricsEmbedMessage(message, clientUserId));
      if (matchesCategory) {
        targetIds.add(message.id);
      }
    }
  } catch (err) {
    fetchFailed = true;
    console.warn(
      `[ChannelCleanup] No se pudo leer el historial del canal ${channel.id}:`,
      err
    );
  }

  let activeGroupId: string | undefined;
  if (lyrics) {
    activeGroupId = lyricsActiveGroupByChannel.get(channel.id);
    if (activeGroupId) {
      for (const id of lyricsMessageMap.get(activeGroupId) ?? []) {
        targetIds.add(id);
      }
    }
  }

  const twoWeeksAgo = Date.now() - TWO_WEEKS_MS;
  const recentIds: string[] = [];
  const oldIds: string[] = [];
  for (const id of targetIds) {
    if (SnowflakeUtil.timestampFrom(id) >= twoWeeksAgo) {
      recentIds.push(id);
    } else {
      oldIds.push(id);
    }
  }

  let deletedCount = 0;
  let failedCount = 0;

  /**
   * Borra un mensaje individual usando el mensaje ya obtenido o recuperándolo por ID.
   * @param id ID del mensaje a borrar.
   */
  const deleteOne = async (id: string): Promise<void> => {
    const message = fetchedMessages.get(id);
    if (message) {
      await message.delete();
      return;
    }
    const fetched = await channel.messages.fetch(id);
    await fetched.delete();
  };

  for (let i = 0; i < recentIds.length; i += MAX_BULK_DELETE) {
    const batch = recentIds.slice(i, i + MAX_BULK_DELETE);
    try {
      const deleted = await channel.bulkDelete(batch, true);
      deletedCount += deleted.size;
    } catch {
      console.warn(
        `[ChannelCleanup] Falló el borrado en lote en el canal ${channel.id}; se reintenta individualmente.`
      );
      for (const id of batch) {
        try {
          await deleteOne(id);
          deletedCount += 1;
        } catch {
          failedCount += 1;
        }
      }
    }
  }

  for (const id of oldIds) {
    try {
      await deleteOne(id);
      deletedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  if (lyrics) {
    if (activeGroupId) {
      lyricsMessageMap.delete(activeGroupId);
    }
    lyricsActiveGroupByChannel.delete(channel.id);
  }

  console.log(
    `[ChannelCleanup] Historial obtenido: ${fetchedCount}; coincidentes: ${
      targetIds.size
    }; borrados: ${deletedCount}; fallidos: ${failedCount}${
      fetchFailed ? '; la lectura del historial falló' : ''
    }.`
  );
}
