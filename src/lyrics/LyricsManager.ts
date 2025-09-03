import {
  TextChannel,
  ButtonInteraction,
  Message,
  PartialMessage,
} from 'discord.js';
import { createHelpMessage } from '../utils/helpMessage';
import { readPanelState } from '../utils/stateManager';
import {
  lyricsMessageMap,
  lyricsActiveGroupByChannel,
} from '../utils/lyricsMessageMap';
import { forceLyricsCleanup } from './lyricsPanelUtils';
import { scheduleLyricsCleanup } from './lyricsCleanup';
import { parseJockieSongFromEmbed } from '../utils/activitySync';
import { findLyrics } from './findLyrics';
import { sendLyricsMessages } from './sendLyricsMessages';

const jockieIds = (process.env.JOCKIE_MUSIC_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

/**
 * Sincroniza el panel de ayuda para habilitar el botón "Letra" cuando hay una canción sonando.
 * Actualiza el mensaje del panel en el canal correspondiente.
 */
export async function onNowPlaying(channel: TextChannel, guildId: string) {
  const state = readPanelState(guildId);
  if (!state?.lastHelpMessageId) return;
  try {
    const panelMsg = await channel.messages.fetch(state.lastHelpMessageId);
    const { embed, components } = createHelpMessage(guildId, channel.id, true);
    await panelMsg.edit({ embeds: [embed], components });
  } catch {}
}

/**
 * Programa la eliminación automática de los mensajes de letra y deshabilita el botón "Letra" en el panel tras un delay.
 * @param channel Canal de texto donde están los mensajes de letra.
 * @param delayMs Milisegundos a esperar antes de eliminar.
 */
export function onStop(channel: TextChannel, delayMs = 10000) {
  scheduleLyricsCleanup(channel, delayMs);
}

/**
 * Limpia los mensajes de letra si se borra el mensaje de "Ahora suena" de Jockie Music.
 * También deshabilita el botón "Letra" en el panel.
 * @param message Mensaje borrado en Discord.
 * @param clientUserId ID del bot para identificar mensajes propios.
 */
export async function onMessageDelete(
  message: Message | PartialMessage,
  clientUserId: string
) {
  if (
    !message.partial &&
    message.author?.id === clientUserId &&
    message.embeds.length > 0 &&
    (message.embeds[0].title?.toLowerCase().includes('ahora suena') ||
      message.embeds[0].title?.toLowerCase().includes('now playing'))
  ) {
    const channel = message.channel;
    if (channel && channel.isTextBased()) {
      await forceLyricsCleanup(channel as TextChannel);
    }
  }
}

/**
 * Maneja la interacción del botón "Letra" en el panel.
 * - Busca la canción actual en el canal.
 * - Obtiene la letra usando todos los artistas posibles.
 * - Publica los mensajes de la letra y el mensaje de confirmación en el canal.
 * - Agrega el botón "Cerrar" en el último mensaje de la letra.
 * - Elimina el mensaje efímero de la interacción para evitar mensajes "pensando...".
 * @param interaction Interacción del botón recibida.
 */
export async function handleLyricsButton(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  if (
    !channel ||
    !(channel instanceof TextChannel) ||
    !('send' in channel) ||
    typeof channel.send !== 'function'
  ) {
    await interaction.editReply('No se pudo detectar el canal.');
    return;
  }

  // Si ya hay letra activa, muestra el mensaje y retorna
  const activeGroupId = lyricsActiveGroupByChannel.get(channel.id);
  if (activeGroupId) {
    const lyricsMsgIds = lyricsMessageMap.get(activeGroupId);
    if (lyricsMsgIds && lyricsMsgIds.length > 0) {
      const existingMsg = await channel.messages
        .fetch(lyricsMsgIds[0])
        .catch(() => null);
      if (existingMsg) {
        await interaction.editReply({
          content: `La letra ya fue solicitada. [Ver mensaje](${existingMsg.url})`,
        });
        return;
      }
      lyricsMessageMap.delete(activeGroupId);
      lyricsActiveGroupByChannel.delete(channel.id);
    }
  }

  // Busca el mensaje de Jockie Music con "Started playing"
  const messages = await channel.messages.fetch({ limit: 30 });
  const nowPlayingMsg = messages
    .filter(
      (msg) =>
        jockieIds.includes(msg.author.id) &&
        msg.embeds.length > 0 &&
        msg.embeds[0].description &&
        /started playing/i.test(msg.embeds[0].description)
    )
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .first();

  if (!nowPlayingMsg) {
    await interaction.editReply(
      'No se pudo detectar la canción actual. Espera a que Jockie Music envíe el mensaje de "Started playing".'
    );
    return;
  }

  // Extrae título y artistas del embed
  const embed = nowPlayingMsg.embeds[0];
  const parsed = embed.description
    ? parseJockieSongFromEmbed(embed.description)
    : null;
  const title = parsed?.song ?? '';
  const artists = parsed?.artists ?? [];
  if (!title || artists.length === 0) {
    await interaction.editReply(
      'No se pudo extraer el título/artista de la canción.'
    );
    return;
  }

  // Busca la letra
  const lyrics = await findLyrics(artists, title);
  if (!lyrics) {
    await interaction.editReply('No se encontró la letra para esta canción.');
    return;
  }

  // Envía los mensajes y registra el grupo
  const groupId = Date.now().toString();
  const msgIds = await sendLyricsMessages(
    channel,
    title,
    artists,
    lyrics,
    interaction.user.tag,
    interaction.user.displayAvatarURL(),
    groupId
  );
  lyricsMessageMap.set(groupId, msgIds);
  lyricsActiveGroupByChannel.set(channel.id, groupId);

  // Elimina el mensaje efímero de la interacción para que no quede "pensando"
  try {
    await interaction.deleteReply();
  } catch {}
}
