import { TextChannel, Message } from 'discord.js';
import { createCloseButtonRow } from '../utils/closeButton';

/**
 * Envía los embeds de la letra y el mensaje de confirmación al canal.
 * Devuelve los IDs de los mensajes enviados.
 */
export async function sendLyricsMessages(
  channel: TextChannel,
  title: string,
  artists: string[],
  lyrics: string,
  userTag: string,
  userAvatar: string,
  groupId: string
): Promise<string[]> {
  const chunks = lyrics.match(/[\s\S]{1,2000}/g) ?? [lyrics];
  const msgIds: string[] = [];
  let firstMsg: Message | undefined;
  let lastMsg: Message | undefined;
  for (let i = 0; i < chunks.length; i++) {
    const lyricsEmbed = {
      color: 0x8e44ad,
      title: `Letra de "${title}" por ${artists.join(', ')}${chunks.length > 1 ? ` (Parte ${i + 1}/${chunks.length})` : ''}`,
      description: chunks[i],
      footer: { text: 'Solicitado por ' + userTag, iconURL: userAvatar },
      timestamp: new Date().toISOString(),
    };
    const msg = await channel.send({ embeds: [lyricsEmbed], components: [] });
    msgIds.push(msg.id);
    if (i === 0) firstMsg = msg;
    lastMsg = msg;
  }
  // Mensaje de confirmación debajo, con link al primer embed
  if (firstMsg) {
    const confirmMsg = await channel.send({
      embeds: [
        {
          color: 0x00ff7f,
          title: 'Letra publicada en el canal',
          description: `[Ver mensaje](${firstMsg.url})\n\nLa letra se ha publicado en varios mensajes para facilitar la lectura.\nCuando termines, puedes cerrar todos los mensajes de la letra usando el botón "Cerrar" en el último mensaje.`,
          timestamp: new Date().toISOString(),
        },
      ],
      components: [],
    });
    msgIds.push(confirmMsg.id);
  }
  // El último mensaje lleva el botón "Cerrar"
  if (lastMsg) {
    const closeRow = createCloseButtonRow(groupId);
    await lastMsg.edit({ components: [closeRow] });
  }
  return msgIds;
}
