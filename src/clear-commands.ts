import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  throw new Error(
    'Error: DISCORD_TOKEN y CLIENT_ID deben estar definidos en el archivo .env'
  );
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('[Clear] Limpiando comandos globales...');

    // Limpiar todos los comandos globales
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });

    console.log('[Clear] Comandos globales limpiados exitosamente.');
    console.log('[Clear] Espera unos minutos y luego ejecuta "npm run deploy"');
  } catch (error) {
    console.error('[Clear] Error:', error);
  }
})();
