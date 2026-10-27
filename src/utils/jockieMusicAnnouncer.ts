import { Message, TextChannel } from 'discord.js';
import {
  detectJockieMusicStatus,
  JockieMusicStatus,
} from './jockieMusicDetector';
import { readPanelState } from './stateManager';
import {
  deletePanel,
  sendPanel,
  sendNowPlayingEmbed,
} from './jockiePanelActions';
import { setBotActivity } from '../services/botActivity';
import { purgeManagedMessages } from '../services/channelCleanup';
import { isRelevantMusicBotMessage } from './musicBotEventHelpers';
import {
  DEFAULT_BOT_STATUS,
  DEFAULT_BOT_ACTIVITY_TYPE,
} from '../constants/botConstants';
import { cancelLyricsCleanup } from '../lyrics/lyricsCleanupScheduler';

const currentlyPlayingLock = new Set<string>();

/**
 * Escribe un log con la hora local.
 * @param msg Mensaje a registrar.
 */
function logWithTime(msg: string) {
  const now = new Date().toLocaleTimeString('es-AR', { hour12: false });
  console.log(`[MusicToEasy][${now}] ${msg}`);
}

/**
 * Maneja los anuncios del bot de música Jockie Music.
 * Detecta cuándo inicia o termina la reproducción y actualiza el panel/logs.
 * @param message Mensaje recibido de Discord.
 * @returns true si se manejó un evento de música relevante (inicio/fin/refresco), false en caso contrario.
 */
export async function handleJockieMusicAnnouncement(
  message: Message
): Promise<boolean> {
  const guild = message.guild;
  if (!guild) return false;

  let text = message.content || '';
  if (message.embeds.length > 0) {
    const embed = message.embeds[0];
    if (embed.description) text += ' ' + embed.description;
  }
  text = text.replace(/\s+/g, ' ').trim();

  let panelChannel: TextChannel | null = null;
  const panelState = readPanelState(guild.id);
  if (panelState?.channelId) {
    const channel = guild.channels.cache.get(panelState.channelId);
    if (channel && channel.isTextBased() && channel instanceof TextChannel) {
      panelChannel = channel;
    }
  }

  // Detecta el estado del bot de música antes de cualquier otra acción
  const status = detectJockieMusicStatus(message);
  if (
    status === JockieMusicStatus.NoMoreTracks ||
    status === JockieMusicStatus.Leaving
  ) {
    // Cambia el estado del bot a estado por defecto (tipo Watching)
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);

    if (panelChannel) {
      await purgeManagedMessages(panelChannel, {
        clientUserId: message.client.user!.id,
        panel: true,
        nowPlaying: true,
        lyrics: true,
      });

      // Reenvía el panel de control limpio.
      await sendPanel(panelChannel, guild.id);
    }
    return true;
  }

  const regex = /started playing\s*(.+)$/i;
  const match = text.match(regex);

  // Evento: "started playing"
  if (match && match[1] && panelChannel) {
    if (currentlyPlayingLock.has(panelChannel.id)) {
      console.log(
        `[MusicToEasy] Ignorando "started playing" duplicado para el canal ${panelChannel.id}`
      );
      return true; // Evento manejado (ignorado)
    }
    currentlyPlayingLock.add(panelChannel.id);
    try {
      const after = match[1].trim();
      if (after) {
        // Extrae nombre y artista para el log
        let song = after;
        let artist = '';
        const songArtistMatch = after.match(/^(.*?)\s+by\s+(.*)$/i);
        if (songArtistMatch) {
          song = songArtistMatch[1].trim();
          artist = songArtistMatch[2].trim();
        }
        logWithTime(`▶️ Escuchando: "${song}"${artist ? ` by ${artist}` : ''}`);

        // Cambia el estado del bot a "▶️ - <canción> by <artista>" (tipo Listening)
        setBotActivity(`▶️ - ${song}${artist ? ` by ${artist}` : ''}`, 2);

        cancelLyricsCleanup(panelChannel.id);

        await purgeManagedMessages(panelChannel, {
          clientUserId: message.client.user!.id,
          panel: true,
          nowPlaying: true,
          lyrics: true,
        });

        // Reenvía el panel y el nuevo embed de "Ahora Suena".
        await sendPanel(panelChannel, guild.id);
        await sendNowPlayingEmbed(panelChannel, after);

        // Envía el embed de "Ahora Suena" también al canal original si es diferente.
        if (
          message.channel instanceof TextChannel &&
          message.channel.id !== panelChannel.id
        ) {
          await sendNowPlayingEmbed(message.channel, after);
        }
        return true;
      }
    } finally {
      currentlyPlayingLock.delete(panelChannel.id);
    }
  }

  // Evento alternativo para refrescar el panel si hay un mensaje de bot de música.
  if (
    panelChannel &&
    message.channel.id === panelChannel.id &&
    isRelevantMusicBotMessage(message) &&
    !/started playing\s*.+/i.test(text)
  ) {
    await deletePanel(panelChannel);
    await sendPanel(panelChannel, guild.id);
    return true;
  }
  return false;
}
