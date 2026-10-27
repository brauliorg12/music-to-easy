import type { BotClient } from './core/BotClient';

let client: BotClient | undefined;

/**
 * Registra la instancia global del cliente del bot.
 * @param bot Instancia del cliente a registrar.
 */
export function setGlobalClient(bot: BotClient): void {
  client = bot;
}

/**
 * Obtiene la instancia global del cliente del bot.
 * @returns La instancia registrada o `undefined` si todavía no se inicializó.
 */
export function getClient(): BotClient | undefined {
  return client;
}
