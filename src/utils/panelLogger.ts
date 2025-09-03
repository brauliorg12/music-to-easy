import { Message, TextChannel } from 'discord.js';

function getJockieBotIds(): string[] {
  return (process.env.JOCKIE_MUSIC_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Registra en consola información sobre la reposición del panel de ayuda.
 * El log varía según si el mensaje que disparó la reposición fue de un bot de música o de un usuario.
 * Incluye información sobre el tipo de mensaje, el autor y un preview del contenido relevante.
 *
 * @param message Mensaje que disparó la reposición del panel.
 * @param channel Canal de texto donde se repuso el panel.
 */
export function logPanelReposition(message: Message, channel: TextChannel) {
  const authorName = message.author.tag;
  if (message.author.bot) {
    let messageType = 'mensaje';
    let contentPreview = '';
    if (message.embeds.length > 0) {
      messageType = 'embed';
      const embed = message.embeds[0];
      // Mostrar título y descripción completos si existen
      if (embed.title && embed.description) {
        contentPreview = `"${embed.title} - ${embed.description}"`;
      } else if (embed.title) {
        contentPreview = `"${embed.title}"`;
      } else if (embed.description) {
        contentPreview = `"${embed.description}"`;
      }
    } else if (message.content) {
      contentPreview = `"${message.content}"`;
    }
    const musicBotIds = getJockieBotIds();
    const knownMusicBot = musicBotIds.includes(message.author.id);
    const botType = knownMusicBot ? 'bot de música' : 'bot';
    console.log(
      `[Monitor] Panel reposicionado tras ${messageType} de ${botType} ${authorName} en #${
        channel.name
      }${contentPreview ? ': ' + contentPreview : ''}`
    );
  } else {
    const messagePreview = message.content;
    console.log(
      `[Monitor] Panel reposicionado tras comando de música de usuario ${authorName} en #${channel.name}: "${messagePreview}"`
    );
  }
}
