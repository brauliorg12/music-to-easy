import { TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';
import { createHelpMessage } from './helpMessage';
import { findJockieNowPlayingSong } from './activitySync';

/**
 * Sincroniza el estado del botón "Letra" en el panel según si hay una canción real sonando.
 */
export async function syncPanelLyricsButton(
  channel: TextChannel,
  guildId: string
) {
  try {
    const state = readPanelState(guildId);
    if (!state?.lastHelpMessageId) return;
    // Usa la misma lógica que la actividad: solo habilita si hay canción real de Jockie
    const nowPlaying = await findJockieNowPlayingSong(channel);
    // Si nowPlaying.artists existe, úsalo para mostrar en el panel si lo necesitas
    const lyricsEnabled = !!nowPlaying;
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
