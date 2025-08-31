import dotenv from 'dotenv';
dotenv.config();

import { BotClient } from './core/BotClient';
import { Message } from 'discord.js';
import { handleMusicLinkSuggestion } from './utils/linkDetector';
import { cleanupAllSuggestions } from './utils/cleanupSuggestions';

function validateEnv(): void {
  if (!process.env.DISCORD_TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
  }
}

function setupGracefulShutdown(bot: BotClient): void {
  process.on('SIGINT', () => {
    console.log('\n[Music to Easy] Cerrando bot...');
    bot.destroy();
    process.exit(0);
  });
}

function main(): void {
  validateEnv();
  const bot = new BotClient();
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
