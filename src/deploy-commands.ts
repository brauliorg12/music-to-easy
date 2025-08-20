import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';
import { data as musicCommand } from './commands/setup';
import { data as disableCommand } from './commands/disable';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    throw new Error('Error: DISCORD_TOKEN y CLIENT_ID deben estar definidos en el archivo .env');
}

const commands = [
    musicCommand.toJSON(),
    disableCommand.toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[Deploy] Desplegando ${commands.length} comando(s).`);
        
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        
        console.log(`[Deploy] Comandos desplegados exitosamente.`);
    } catch (error) {
        console.error('[Deploy] Error:', error);
    }
})();
