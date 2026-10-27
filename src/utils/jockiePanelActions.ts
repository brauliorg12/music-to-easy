import { TextChannel, EmbedBuilder } from 'discord.js';
import { createHelpMessage } from './helpMessage';
import { writePanelState, readPanelState } from './stateManager';
import { isJockieBotId } from './jockieIds';
import { getClient } from '../globalClient';
import { cleanupAllHelpPanels } from './panelCleaner';
import { NOW_PLAYING_EMBED_TITLE } from './constants';

/**
 * Elimina todos los paneles de ayuda existentes en el canal.
 * @param channel Canal de texto donde se limpiarán los paneles.
 */
export async function deletePanel(channel: TextChannel) {
  // Limpia todos los paneles existentes en lugar de buscar uno puntual.
  await cleanupAllHelpPanels(channel.client.user!.id, channel);
  console.log('[MusicToEasy] Paneles anteriores limpiados.');
}

/**
 * Envía el panel de comandos al canal y persiste su ID como estado del servidor.
 * @param channel Canal de texto donde se enviará el panel.
 * @param guildId ID del servidor al que pertenece el panel.
 * @param lyricsEnabled Fuerza el estado del botón "Letra"; si se omite se deduce de la actividad actual.
 * @returns El mensaje del panel enviado.
 */
export async function sendPanel(
  channel: TextChannel,
  guildId: string,
  lyricsEnabled?: boolean
) {
  const client = getClient();
  let finalLyricsEnabled = lyricsEnabled;

  if (finalLyricsEnabled === undefined) {
    // Si no se especifica, decidir en base a la actividad del bot.
    // Tipo 2 es "Listening to", lo que implica que hay una canción.
    finalLyricsEnabled = client?.currentActivityType === 2;
  }

  const { embed, components } = createHelpMessage(
    guildId,
    channel.id,
    finalLyricsEnabled
  );
  const newPanel = await channel.send({ embeds: [embed], components });
  console.log('[MusicToEasy] Panel de comandos enviado con ID:', newPanel.id);
  writePanelState({
    guildId,
    channelId: channel.id,
    lastHelpMessageId: newPanel.id,
  });
  return newPanel;
}

/**
 * Envía el embed "¡Ahora suena!" con la descripción de la canción actual.
 * @param channel Canal de texto donde se enviará el embed.
 * @param after Descripción original de la canción tal como la envió Jockie Music.
 */
export async function sendNowPlayingEmbed(
  channel: TextChannel,
  after: string
) {
  const guild = channel.guild;

  let jockieName = '';
  const jockieMember = guild.members.cache.find((m) =>
    isJockieBotId(m.user.id)
  );
  if (jockieMember) {
    jockieName = `${jockieMember.displayName} está reproduciendo música`;
  } else {
    jockieName = 'Jockie Music está reproduciendo música';
  }

  const playingEmbed = new EmbedBuilder()
    .setColor(0x1db954)
    .setTitle(NOW_PLAYING_EMBED_TITLE)
    .setDescription(after)
    .setFooter({ text: jockieName });
  await channel.send({ embeds: [playingEmbed] });
  console.log(
    '[MusicToEasy] Embed "¡Ahora suena!" enviado en canal del panel.'
  );
}

/**
 * Actualiza el panel del canal para deshabilitar el botón "Letra".
 * @param channel Canal de texto donde está el panel.
 */
export async function disableLyricsButtonInPanel(channel: TextChannel) {
  // Busca el panel actual y lo reemplaza por uno con el botón deshabilitado
  const state = readPanelState(channel.guildId);
  if (!state?.lastHelpMessageId) return;
  try {
    const panelMsg = await channel.messages.fetch(state.lastHelpMessageId);
    const { embed, components } = createHelpMessage(
      channel.guildId,
      channel.id,
      false
    );
    await panelMsg.edit({ embeds: [embed], components });
  } catch {
    // Si el mensaje no existe, ignora
  }
}
