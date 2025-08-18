import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';

// --- Validación de Variables de Entorno ---
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Para despliegue en un solo servidor (opcional para comandos globales)

if (!TOKEN || !CLIENT_ID) {
    throw new Error('Error: DISCORD_TOKEN y CLIENT_ID deben estar definidos en el archivo .env');
}

// --- Carga Estática de Comandos (como en refapp) ---
// Importamos el comando 'setup' directamente.
// Asegúrate de que la ruta sea correcta y que el archivo exporte 'data'.
import { data as setupCommand } from './commands/setup'; 

const commands = [
    setupCommand.toJSON()
    // Si tienes más comandos, añádelos aquí de la misma forma.
    // ej: anotherCommand.toJSON()
];

console.log(`[Deploy] Preparados ${commands.length} comandos para despliegue.`);

// --- Despliegue de Comandos ---
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[Deploy] Iniciando despliegue de comandos globalmente.`);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`[Deploy] Desplegados exitosamente ${commands.length} comandos globalmente.`);
    } catch (error) {
        console.error('[Deploy] [ERROR] Error al desplegar los comandos:', error);
    }
})();
