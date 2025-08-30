import { Message, TextChannel } from 'discord.js';
import { COMMON_MUSIC_BOTS } from './constants';

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
    const knownMusicBot = COMMON_MUSIC_BOTS.includes(message.author.id);
    const botType = knownMusicBot ? 'bot de música' : 'bot';
    console.log(
      `[Monitor] Panel reposicionado tras ${messageType} de ${botType} ${authorName} en #${channel.name}${contentPreview ? ': ' + contentPreview : ''}`
    );
  } else {
    const messagePreview = message.content;
    console.log(
      `[Monitor] Panel reposicionado tras comando de música de usuario ${authorName} en #${channel.name}: "${messagePreview}"`
    );
  }
}
