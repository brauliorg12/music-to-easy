import { BotClient } from '../core/BotClient';
import { TextChannel } from 'discord.js';
import { readPanelState } from './stateManager';

const SUGGESTION_TIMEOUT = 60; // segundos

/**
 * Limpia los mensajes de sugerencia de comando en todos los canales con panel activo,
 * pero solo elimina sugerencias con más de SUGGESTION_TIMEOUT segundos de antigüedad.
 * @param bot Instancia del BotClient
 */
export async function cleanupAllSuggestions(bot: BotClient): Promise<void> {
  const guilds = bot.guilds.cache;
  const now = Date.now();
  for (const [guildId, guild] of guilds) {
    const panelState = readPanelState(guildId);
    if (!panelState || !panelState.channelId) continue;
    const channel = guild.channels.cache.get(panelState.channelId);
    if (!channel || channel.type !== 0) continue; // 0 = GuildText
    try {
      const messages = await (channel as TextChannel).messages.fetch({ limit: 50 });
      const suggestionMessages = messages.filter(
        m =>
          m.author.id === bot.user?.id &&
          m.embeds[0]?.title === '🎵 Sugerencia de comando' &&
          m.createdTimestamp < now - SUGGESTION_TIMEOUT * 1000 // Solo las viejas
      );
      for (const msg of suggestionMessages.values()) {
        await msg.delete().catch(() => {});
      }
    } catch {
      // No es crítico si falla
    }
  }
}
