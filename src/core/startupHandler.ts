import { BotClient } from './BotClient';
import { BotPanelState, writePanelState } from '../utils/stateManager';
import { cleanupAllHelpPanels } from '../utils/panelCleaner';
import { repositionPanel } from '../utils/repositionPanel';
import { syncPanelLyricsButton } from '../utils/panelLyricsSync';
import { findJockieNowPlayingSong } from '../utils/activitySync';
import { setBotActivity } from '../utils/jockiePanelActions';
import {
  DEFAULT_BOT_STATUS,
  DEFAULT_BOT_ACTIVITY_TYPE,
} from '../constants/botConstants';
import fs from 'fs';
import path from 'path';
import { TextChannel } from 'discord.js';
import { cleanupLyrics } from '../lyrics/lyricsCleanup';

/**
 * Maneja la sincronización de los paneles y la actividad del bot cuando se inicia.
 * Itera a través de todos los estados guardados, reposiciona los paneles y
 * establece la actividad del bot según si encuentra una canción en reproducción.
 * @param client El cliente del bot de Discord.
 */
export async function handleStartupPanelSync(client: BotClient) {
  const dbDir = path.resolve(__dirname, '../../db');
  if (!fs.existsSync(dbDir)) {
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);
    return;
  }

  const files = fs
    .readdirSync(dbDir)
    .filter((f) => f.startsWith('bot-state-') && f.endsWith('.json'));

  let foundNowPlaying = false;

  for (const file of files) {
    try {
      const state: BotPanelState = JSON.parse(
        fs.readFileSync(path.join(dbDir, file), 'utf8')
      );
      if (!state.guildId || !state.channelId) continue;

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

        await syncPanelLyricsButton(channel, state.guildId);

        // Si aún no hemos encontrado una canción, buscar en este canal
        if (!foundNowPlaying) {
          const nowPlaying = await findJockieNowPlayingSong(channel);
          if (nowPlaying && nowPlaying.song) {
            const artistText =
              nowPlaying.artists.length > 0
                ? ` by ${nowPlaying.artists.join(', ')}`
                : '';
            setBotActivity(`▶️ - ${nowPlaying.song}${artistText}`, 2);
            foundNowPlaying = true; // Marcar que ya encontramos una
          }
        }

        console.log(
          `[Panel] Panel de comandos repuesto automáticamente en ${guild.name} (${guild.id}).`
        );
      }
    } catch (err) {
      console.warn(
        `[Panel] No se pudo reponer el panel para el estado en ${file}:`,
        err
      );
    }
  }

  // Si después de revisar todos los servidores no se encontró música, poner estado por defecto.
  if (!foundNowPlaying) {
    setBotActivity(DEFAULT_BOT_STATUS, DEFAULT_BOT_ACTIVITY_TYPE);
  }
}
