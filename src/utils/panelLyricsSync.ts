import { TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';
import { createHelpMessage } from './helpMessage';
import {
  findJockieNowPlayingSong,
  type JockieSongInfo,
} from './activitySync';

/**
 * Sincroniza el estado del botón "Letra" del panel según si hay una canción sonando.
 * @param channel Canal de texto donde está el panel.
 * @param guildId ID del servidor al que pertenece el panel.
 * @param nowPlaying Canción detectada previamente. Si es `undefined` se busca en el canal;
 * si es `null` se interpreta que no hay canción activa.
 */
export async function syncPanelLyricsButton(
  channel: TextChannel,
  guildId: string,
  nowPlaying?: JockieSongInfo | null
) {
  try {
    const state = readPanelState(guildId);
    if (!state?.lastHelpMessageId) return;
    // Usa la misma lógica que la actividad: solo habilita si hay canción real de Jockie
    const currentSong =
      nowPlaying === undefined
        ? await findJockieNowPlayingSong(channel)
        : nowPlaying;
    const lyricsEnabled = !!currentSong;
    const panelMsg = await channel.messages.fetch(state.lastHelpMessageId);
    const { embed, components } = createHelpMessage(
      guildId,
      channel.id,
      lyricsEnabled
    );
    await panelMsg.edit({ embeds: [embed], components });
    console.log(
      `[PanelLyricsSync] Panel editado en canal ${channel.id} (lyricsEnabled=${lyricsEnabled})`
    );
  } catch (err) {
    console.error(
      `[PanelLyricsSync] Error al sincronizar panel en canal ${channel.id}:`,
      err
    );
  }
}
