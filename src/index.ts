import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, Message, Interaction, CommandInteraction, ButtonInteraction, ModalSubmitInteraction, TextChannel } from 'discord.js';
import { CUSTOM_IDS } from './utils/constants';
import { createHelpMessage } from './utils/helpMessage';
import BotState from './utils/botState';

/**
 * Music to Easy - Discord Bot
 * Extended Discord Client with additional collections for interactions
 */
class MusicToEasyBot extends Client {
    public commands: Collection<string, any> = new Collection();
    public buttonInteractions: Collection<string, any> = new Collection();
    public modalInteractions: Collection<string, any> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.loadCommands();
        this.loadInteractions();
        this.setupEventHandlers();
    }

    private loadCommands(): void {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if (command.data && command.execute) {
                this.commands.set(command.data.name, command);
                console.log(`[Carga] Comando '${command.data.name}' cargado.`);
            } else {
                console.warn(`[Advertencia] El comando en ${filePath} le falta la propiedad 'data' o 'execute'.`);
            }
        }
    }

    private loadInteractions(): void {
        const interactionsPath = path.join(__dirname, 'interactions');
        const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.ts'));

        for (const file of interactionFiles) {
            const filePath = path.join(interactionsPath, file);
            const interactionHandler = require(filePath);

            const expectedCustomId = file.replace('.ts', '');
            const customIdKey = Object.keys(CUSTOM_IDS).find(key => CUSTOM_IDS[key as keyof typeof CUSTOM_IDS] === expectedCustomId);

            if (customIdKey) {
                const customId = CUSTOM_IDS[customIdKey as keyof typeof CUSTOM_IDS];
                this.buttonInteractions.set(customId, interactionHandler);
                console.log(`[Carga] Manejador '${customId}' cargado.`);
            } else {
                console.warn(`[Advertencia] No se encontró un CUSTOM_ID para el archivo ${file} (esperaba: ${expectedCustomId})`);
            }
        }
    }

    private setupEventHandlers(): void {
        this.once('ready', () => {
            console.log(`[Music to Easy] Bot iniciado como ${this.user?.tag}!`);
            console.log(`[Info] Monitoreando ${this.guilds.cache.size} servidores`);
        });

        this.on('messageCreate', this.handleMessageCreate.bind(this));
        this.on('interactionCreate', this.handleInteractionCreate.bind(this));
    }

    private async handleMessageCreate(message: Message): Promise<void> {
        const botState = BotState.getInstance();

        if (message.author.id === this.user?.id) return;
        if (message.channelId !== botState.getChannel()) return;
        if (!message.author.bot) return;

        try {
            const channel = message.channel as TextChannel;

            const lastMessageId = botState.getLastMessageId();
            if (lastMessageId) {
                try {
                    const oldMessage = await channel.messages.fetch(lastMessageId);
                    await oldMessage.delete();
                    botState.clearLastMessageId();
                } catch (e) {
                    botState.clearLastMessageId();
                }
            }

            const { embed, components } = createHelpMessage();
            const newHelpMessage = await channel.send({
                embeds: [embed],
                components: components
            });

            botState.setLastMessageId(newHelpMessage.id);

            console.log(`[Monitor] Mensaje de ayuda reenvíado tras mensaje de ${message.author.tag}`);
        } catch (error) {
            console.error('[Monitor] Error al reenviar mensaje de ayuda:', error);
        }
    }

    private async handleInteractionCreate(interaction: Interaction): Promise<void> {
        if (interaction.isCommand()) {
            const command = this.commands.get(interaction.commandName);
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
            const buttonHandler = this.buttonInteractions.get(interaction.customId);
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
            const modalHandler = this.modalInteractions.get(interaction.customId);
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
    }
}

// Initialize and start the bot
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

const bot = new MusicToEasyBot();

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n[Music to Easy] Cerrando bot...');
    bot.destroy();
    process.exit(0);
});

// Start the bot
bot.login(TOKEN);
