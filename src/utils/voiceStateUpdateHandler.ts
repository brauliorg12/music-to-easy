import { VoiceState, TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';
import { disableLyricsButtonInPanel } from './jockiePanelActions';
import { setBotActivity } from '../services/botActivity';
import { purgeManagedMessages } from '../services/channelCleanup';
import {
  DEFAULT_BOT_STATUS,
  DEFAULT_BOT_ACTIVITY_TYPE,
} from '../constants/botConstants';
import { isJockieBotId } from './jockieIds';

/**
 * Maneja el evento de actualización de estado de voz.
 * Detecta si un bot de música configurado ha sido desconectado de un canal de voz
 * y, si es así, limpia el estado del bot (panel, letras, actividad).
 * @param oldState El estado de voz anterior.
 * @param newState El estado de voz nuevo.
 */
export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState
) {
  const botId = oldState.id;

  // 1. Verificar si el usuario afectado es un bot de música configurado.
  if (!isJockieBotId(botId)) {
    return;
  }

  // 2. Verificar si el bot fue desconectado (estaba en un canal y ahora no).
  const wasInChannel = oldState.channelId;
  const isInChannel = newState.channelId;

  if (wasInChannel && !isInChannel) {
    // El bot ha abandonado un canal de voz.
    const guild = oldState.guild;
    console.log(
      `[VoiceUpdate] El bot de música ${botId} ha abandonado un canal de voz en el servidor ${guild.name}.`
    );

    // 3. Encontrar el canal del panel para este servidor.
    const panelState = readPanelState(guild.id);
    if (!panelState?.channelId) return;

    const channel = await guild.channels
      .fetch(panelState.channelId)
      .catch(() => null);
    if (!channel || !(channel instanceof TextChannel)) return;

    // 4. Ejecutar la lógica de limpieza completa.
    console.log(
      `[VoiceUpdate] Iniciando limpieza en el canal #${channel.name} para el servidor ${guild.name}.`
    );
    await purgeManagedMessages(channel, {
      clientUserId: newState.client.user!.id,
      panel: false,
      nowPlaying: true,
      lyrics: true,
    });
    await disableLyricsButtonInPanel(channel);
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);
  }
}
