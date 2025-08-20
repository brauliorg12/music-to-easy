import dotenv from 'dotenv';
dotenv.config();

import { BotClient } from './core/BotClient';

// Initialize and start the bot
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('[ERROR] DISCORD_TOKEN no está definido en el archivo .env');
  process.exit(1);
}

const bot = new BotClient();

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[Music to Easy] Cerrando bot...');
  bot.destroy();
  process.exit(0);
});

// Start the bot
bot.login(TOKEN);
