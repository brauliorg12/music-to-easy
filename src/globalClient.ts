import type { BotClient } from './core/BotClient';

export let client: BotClient | undefined = undefined;

export function setGlobalClient(bot: BotClient) {
  client = bot;
}
