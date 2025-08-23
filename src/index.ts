import dotenv from 'dotenv';
dotenv.config();

import { BotClient } from './core/BotClient';

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
  bot.login(process.env.DISCORD_TOKEN);
}

main();
