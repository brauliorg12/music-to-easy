import { Message, TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';
import { onNowPlaying, onStop } from '../lyrics/LyricsManager';
import { isRelevantMusicBotMessage } from './musicBotEventHelpers';

/**
 * Procesa los mensajes relevantes de los bots de música en Discord.
 * - Si detecta un mensaje de "Ahora suena"/"Now playing" de Jockie Music, habilita el botón "Letra" en el panel del canal.
 * - Si detecta un mensaje de parada ("Nada está sonando", "Not playing", "Desconectado", etc.) o comandos de stop/skip/next/leave/disconnect,
 *   programa la limpieza de los mensajes de letra y deshabilita el botón "Letra" tras un delay.
 *
 * Esta función centraliza la lógica de sincronización entre los mensajes de actividad musical y el panel de ayuda,
 * permitiendo que el panel refleje el estado real de la música en el canal.
 *
 * @param message Mensaje recibido en Discord.
 */
export async function handleMusicPanelEvents(message: Message) {
  if (!isRelevantMusicBotMessage(message)) return;

  const musicBotId = process.env.JOCKIE_MUSIC_IDS?.split(',')[0];
  const isNowPlaying =
    message.author.id === musicBotId &&
    message.embeds.length > 0 &&
    (message.embeds[0].title?.toLowerCase().includes('ahora suena') ||
      message.embeds[0].title?.toLowerCase().includes('now playing'));

  const isStop =
    message.author.id === musicBotId &&
    ((message.embeds.length > 0 &&
      (message.embeds[0].title?.toLowerCase().includes('nada está sonando') ||
        message.embeds[0].title?.toLowerCase().includes('not playing') ||
        message.embeds[0].title?.toLowerCase().includes('desconectado') ||
        message.embeds[0].title?.toLowerCase().includes('disconnected') ||
        message.embeds[0].description
          ?.toLowerCase()
          .includes('no hay nada sonando') ||
        message.embeds[0].description?.toLowerCase().includes('not playing') ||
        message.embeds[0].description?.toLowerCase().includes('desconectado') ||
        message.embeds[0].description
          ?.toLowerCase()
          .includes('disconnected'))) ||
      (typeof message.content === 'string' &&
        (message.content.toLowerCase().includes('stop') ||
          message.content.toLowerCase().includes('skip') ||
          message.content.toLowerCase().includes('next') ||
          message.content.toLowerCase().includes('leave') ||
          message.content.toLowerCase().includes('disconnect'))));

  if (isNowPlaying && message.guild) {
    const state = readPanelState(message.guild.id);
    if (!state?.channelId) return;
    const channel = message.guild.channels.cache.get(
      state.channelId
    ) as TextChannel;
    if (!channel) return;
    await onNowPlaying(channel, message.guild.id);
    return;
  }

  if (isStop && message.guild) {
    const state = readPanelState(message.guild.id);
    if (!state?.channelId) return;
    const channel = message.guild.channels.cache.get(
      state.channelId
    ) as TextChannel;
    if (!channel) return;
    onStop(channel, 10000);
    return;
  }
}
