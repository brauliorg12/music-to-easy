import { BotClient } from './BotClient';
import { readAllPanelStates, writePanelState } from '../utils/stateManager';
import { cleanupAllHelpPanels } from '../utils/panelCleaner';
import { repositionPanel } from '../utils/repositionPanel';
import { syncPanelLyricsButton } from '../utils/panelLyricsSync';
import {
  findJockieNowPlayingSong,
  type JockieSongInfo,
} from '../utils/activitySync';
import { setBotActivity } from '../services/botActivity';
import {
  DEFAULT_BOT_STATUS,
  DEFAULT_BOT_ACTIVITY_TYPE,
} from '../constants/botConstants';
import { TextChannel } from 'discord.js';
import { cleanupLyrics } from '../lyrics/lyricsCleanup';

/**
 * Maneja la sincronización de los paneles y la actividad del bot cuando se inicia.
 * Itera a través de todos los estados guardados, reposiciona los paneles y
 * establece la actividad del bot según si encuentra una canción en reproducción.
 * @param client El cliente del bot de Discord.
 */
export async function handleStartupPanelSync(client: BotClient) {
  const states = readAllPanelStates();
  let foundNowPlaying = false;

  for (const state of states) {
    try {
      const guild = await client.guilds.fetch(state.guildId).catch(() => null);
      if (!guild) continue;

      const channel = await client.channels
        .fetch(state.channelId)
        .catch(() => null);
      if (channel && channel.isTextBased() && channel instanceof TextChannel) {
        await cleanupAllHelpPanels(client.user!.id, channel);

        console.log(
          `[Startup] Limpiando letras antiguas en el canal #${channel.name}...`
        );
        await cleanupLyrics(channel);

        const newPanel = await repositionPanel(
          channel,
          state.guildId,
          state.channelId
        );

        writePanelState({
          guildId: state.guildId,
          channelId: state.channelId,
          lastHelpMessageId: newPanel.id,
        });

        let nowPlaying: JockieSongInfo | null = null;
        try {
          nowPlaying = await findJockieNowPlayingSong(channel);
        } catch (err) {
          console.warn(
            `[Startup] No se pudo detectar la canción en el canal #${channel.name}:`,
            err
          );
        }

        await syncPanelLyricsButton(channel, state.guildId, nowPlaying);

        if (!foundNowPlaying && nowPlaying && nowPlaying.song) {
          const artistText =
            nowPlaying.artists.length > 0
              ? ` by ${nowPlaying.artists.join(', ')}`
              : '';
          setBotActivity(`▶️ - ${nowPlaying.song}${artistText}`, 2);
          foundNowPlaying = true;
        }

        console.log(
          `[Panel] Panel de comandos repuesto automáticamente en ${guild.name} (${guild.id}).`
        );
      }
    } catch (err) {
      console.warn(
        `[Panel] No se pudo reponer el panel para el estado en el servidor ${state.guildId}:`,
        err
      );
    }
  }

  // Si después de revisar todos los servidores no se encontró música, poner estado por defecto.
  if (!foundNowPlaying) {
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);
  }
}
