import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, Interaction, CommandInteraction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { CUSTOM_IDS } from './utils/constants';

// Extend Client class to hold commands and interaction handlers
class BotClient extends Client {
    commands: Collection<string, any> = new Collection();
    buttonInteractions: Collection<string, any> = new Collection();
    modalInteractions: Collection<string, any> = new Collection();
}

const client = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[Carga] Comando '${command.data.name}' cargado.`);
    } else {
        console.warn(`[Advertencia] El comando en ${filePath} le falta la propiedad 'data' o 'execute'.`);
    }
}

// Load Interaction Handlers (Buttons and Modals)
const interactionsPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.ts'));

for (const file of interactionFiles) {
    const filePath = path.join(interactionsPath, file);
    const interactionHandler = require(filePath);

    // Determine if it's a button or modal handler based on its filename or content
    // For simplicity, we'll assume naming convention: 'buttonName.ts' for buttons, 'modalName.ts' for modals
    // A more robust solution might involve an interface with a 'customId' property
    if (file.includes('Button.ts')) {
        const customIdKey = Object.keys(CUSTOM_IDS).find(key => CUSTOM_IDS[key as keyof typeof CUSTOM_IDS] === file.replace('.ts', '').replace('Button', '_button').toLowerCase());
        if (customIdKey) {
            const customId = CUSTOM_IDS[customIdKey as keyof typeof CUSTOM_IDS];
            client.buttonInteractions.set(customId, interactionHandler);
            console.log(`[Carga] Manejador de botón '${customId}' cargado.`);
        } else {
            console.warn(`[Advertencia] No se encontró un CUSTOM_ID para el manejador de botón ${file}.`);
        }
    } else if (file.includes('ModalSubmit.ts')) {
        const customIdKey = Object.keys(CUSTOM_IDS).find(key => CUSTOM_IDS[key as keyof typeof CUSTOM_IDS] === file.replace('.ts', '').replace('ModalSubmit', '_modal').toLowerCase());
        if (customIdKey) {
            const customId = CUSTOM_IDS[customIdKey as keyof typeof CUSTOM_IDS];
            client.modalInteractions.set(customId, interactionHandler);
            console.log(`[Carga] Manejador de modal '${customId}' cargado.`);
        } else {
            console.warn(`[Advertencia] No se encontró un CUSTOM_ID para el manejador de modal ${file}.`);
        }
    }
}

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

client.on('ready', () => {
    console.log(`[Inicio] Bot iniciado como ${client.user?.tag}!`);
});

// Interaction Handler
client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.warn(`[Advertencia] Comando desconocido: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction as CommandInteraction);
            console.log(`[Interacción] Comando '${interaction.commandName}' ejecutado por ${interaction.user.tag}.`);
        } catch (error) {
            console.error(`[ERROR] Error al ejecutar el comando '${interaction.commandName}':`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        const buttonHandler = client.buttonInteractions.get(interaction.customId);
        if (!buttonHandler) {
            console.warn(`[Advertencia] Manejador de botón desconocido: ${interaction.customId}`);
            return;
        }

        try {
            await buttonHandler.execute(interaction as ButtonInteraction);
            console.log(`[Interacción] Botón '${interaction.customId}' presionado por ${interaction.user.tag}.`);
        } catch (error) {
            console.error(`[ERROR] Error al manejar el botón '${interaction.customId}':`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al procesar este botón!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al procesar este botón!', ephemeral: true });
            }
        }
    } else if (interaction.isModalSubmit()) {
        const modalHandler = client.modalInteractions.get(interaction.customId);
        if (!modalHandler) {
            console.warn(`[Advertencia] Manejador de modal desconocido: ${interaction.customId}`);
            return;
        }

        try {
            await modalHandler.execute(interaction as ModalSubmitInteraction);
            console.log(`[Interacción] Modal '${interaction.customId}' enviado por ${interaction.user.tag}.`);
        } catch (error) {
            console.error(`[ERROR] Error al manejar el modal '${interaction.customId}':`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al procesar este formulario!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al procesar este formulario!', ephemeral: true });
            }
        }
    }
});

client.login(TOKEN);
