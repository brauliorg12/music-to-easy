import dotenv from 'dotenv';
dotenv.config();

import { BotClient } from './core/BotClient';
import { Message } from 'discord.js';
import { handleMusicLinkSuggestion } from './utils/linkDetector';
import { cleanupAllSuggestions } from './utils/cleanupSuggestions';
import { setGlobalClient } from './globalClient';

// Bandera global para saber si el bot está inicializando
export let isInitializing = true;

/**
 * Valida que las variables de entorno críticas estén definidas.
 * Si falta alguna, termina el proceso con error.
 */
function validateEnv(): void {
  if (!process.env.DISCORD_TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
  }
}

/**
 * Configura el cierre limpio del bot al recibir SIGINT (Ctrl+C).
 * Desconecta el bot y termina el proceso.
 * @param bot Instancia del bot.
 */
function setupGracefulShutdown(bot: BotClient): void {
  process.on('SIGINT', () => {
    console.log('\n[Music to Easy] Cerrando bot...');
    bot.destroy();
    process.exit(0);
  });
}

/**
 * Función principal de arranque del bot.
 * - Valida variables de entorno.
 * - Crea la instancia del bot y la asigna a globalThis.
 * - Configura el cierre limpio.
 * - Limpia sugerencias viejas al iniciar.
 * - Setea la actividad por defecto.
 * - Agrega el listener para sugerencias de comando.
 * - Inicia sesión en Discord.
 */
function main(): void {
  validateEnv();
  const bot = new BotClient();
  setGlobalClient(bot); // NUEVO: expone el bot globalmente
  // Asigna el bot a globalThis.client para que setBotActivity lo encuentre
  (globalThis as any).client = bot;
  setupGracefulShutdown(bot);

  // Limpia mensajes de sugerencia de comando ("Sugerencia de comando") en todos los canales con panel activo al iniciar el bot.
  bot.once('ready', async () => {
    await cleanupAllSuggestions(bot);
    console.log(
      '[Music to Easy] Limpieza de sugerencias de comando completada al iniciar.'
    );
  });

  // Listener para sugerir el comando correcto si el usuario envía un link de música o nombre de canción directamente en el chat.
  bot.on('messageCreate', async (message: Message) => {
    await handleMusicLinkSuggestion(message);
  });

  bot.login(process.env.DISCORD_TOKEN);
}

main();
