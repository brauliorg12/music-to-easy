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
  deleteNowPlayingEmbed,
  setBotActivity,
} from './jockiePanelActions';
import { isRelevantMusicBotMessage } from './musicBotEventHelpers';
import {
  DEFAULT_BOT_STATUS,
  DEFAULT_BOT_ACTIVITY_TYPE,
} from '../constants/botConstants';

function logWithTime(msg: string) {
  const now = new Date().toLocaleTimeString('es-AR', { hour12: false });
  console.log(`[MusicToEasy][${now}] ${msg}`);
}

/**
 * Maneja los anuncios del bot de música Jockie Music.
 * Detecta cuándo inicia o termina la reproducción y actualiza el panel/logs.
 * @param message Mensaje recibido de Discord.
 */
export async function handleJockieMusicAnnouncement(message: Message) {
  const guild = message.guild;
  if (!guild) return;

  let text = message.content || '';
  if (message.embeds.length > 0) {
    const embed = message.embeds[0];
    if (embed.description) text += ' ' + embed.description;
  }
  text = text.replace(/\s+/g, ' ').trim();

  let panelChannel: TextChannel | null = null;
  let panelState = readPanelState(guild.id);
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
    if (panelChannel) {
      // Solo elimina una vez el mensaje "¡Ahora suena!"
      await deleteNowPlayingEmbed(panelChannel, message.client.user!.id);
      await deletePanel(
        panelChannel,
        panelState?.lastHelpMessageId ?? undefined
      );
      await sendPanel(panelChannel, guild.id);
    }
    // Cambia el estado del bot a estado por defecto (tipo Watching)
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);
    return;
  }

  let alreadyHandled = false;
  const regex = /started playing\s*(.+)$/i;
  const match = text.match(regex);

  // Paso 1: started playing
  if (match && match[1] && panelChannel) {
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
      // Elimina el mensaje "¡Ahora suena!" antes de enviar uno nuevo
      await deleteNowPlayingEmbed(panelChannel, message.client.user!.id);
      await deletePanel(
        panelChannel,
        panelState?.lastHelpMessageId ?? undefined
      );
      await sendPanel(panelChannel, guild.id);
      await sendNowPlayingEmbed(panelChannel, after, message.client);
      // Topic en canal original si es diferente
      if (
        message.channel instanceof TextChannel &&
        message.channel.id !== panelChannel.id
      ) {
        await sendNowPlayingEmbed(message.channel, after, message.client);
      }
      alreadyHandled = true;
      return;
    }
  }

  // Paso 1 extra: Evento alternativo solo para bots de música conocidos
  if (
    !alreadyHandled &&
    panelChannel &&
    message.channel.id === panelChannel.id &&
    isRelevantMusicBotMessage(message) &&
    !/started playing\s*.+/i.test(text)
  ) {
    await deletePanel(panelChannel, panelState?.lastHelpMessageId ?? undefined);
    await sendPanel(panelChannel, guild.id);
    return;
  }
}
