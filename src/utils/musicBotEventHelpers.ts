import { Message } from 'discord.js';

function getJockieBotIds(): string[] {
  return (process.env.JOCKIE_MUSIC_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Determina si un mensaje proviene de un bot de música relevante y contiene un embed válido,
 * excluyendo los mensajes generados por este bot con el panel de comandos de música.
 *
 * @param message - El mensaje a evaluar.
 * @returns true si el mensaje es relevante para la lógica de bots de música, false en caso contrario.
 */
export function isRelevantMusicBotMessage(message: Message): boolean {
  const musicBotIds = getJockieBotIds();
  return (
    message.author.bot &&
    musicBotIds.includes(message.author.id) &&
    message.embeds.length > 0 &&
    !(
      message.author.id === message.client.user?.id &&
      message.embeds[0]?.title?.includes('Comandos de Música')
    )
  );
}
