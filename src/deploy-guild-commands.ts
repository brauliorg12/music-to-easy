import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';
import { data as setupCommand } from './commands/setup';
import { data as disableCommand } from './commands/disable';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    throw new Error('Error: DISCORD_TOKEN, CLIENT_ID y GUILD_ID deben estar definidos en el archivo .env');
}

const commands = [
    setupCommand.toJSON(),
    disableCommand.toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[Deploy Guild] Desplegando ${commands.length} comando(s) al servidor ${GUILD_ID}.`);
        
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        
        console.log(`[Deploy Guild] Comandos del servidor desplegados exitosamente.`);
    } catch (error) {
        console.error('[Deploy Guild] Error:', error);
    }
})();
