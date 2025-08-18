import { ChatInputCommandInteraction, Message, ButtonInteraction, ModalSubmitInteraction, TextChannel, DMChannel } from 'discord.js';

/**
 * Simula la interacción con un bot de música externo.
 * En un entorno real, estas funciones enviarían comandos al bot de música.
 */
export class MusicService {
    private static instance: MusicService;

    private constructor() {}

    public static getInstance(): MusicService {
        if (!MusicService.instance) {
            MusicService.instance = new MusicService();
        }
        return MusicService.instance;
    }

    private getInteractionUserTag(interaction: ChatInputCommandInteraction | Message | ButtonInteraction | ModalSubmitInteraction): string {
        if ('user' in interaction) {
            return interaction.user.tag;
        } else if ('author' in interaction) {
            return interaction.author.tag;
        }
        return 'Desconocido';
    }

    /**
     * Simula la reproducción de una canción.
     * @param interaction La interacción de comando o modal que inició la reproducción.
     * @param query La consulta de la canción (nombre o URL).
     */
    public async play(interaction: ChatInputCommandInteraction | ModalSubmitInteraction, query: string): Promise<void> {
        const userTag = this.getInteractionUserTag(interaction);
        console.log(`[MusicService] Solicitud de reproducción: "${query}" por ${userTag}`);
        
        const channel = interaction.channel;
        if (channel instanceof TextChannel) {
            try {
                const webhookName = 'Music Command Webhook';
                let webhook = (await channel.fetchWebhooks()).find(wh => wh.name === webhookName);

                if (!webhook) {
                    webhook = await channel.createWebhook({
                        name: webhookName,
                        reason: 'Para enviar comandos de música en nombre de los usuarios.'
                    });
                }

                // interaction.member is guaranteed to exist in a TextChannel
                const member = interaction.member as { displayName: string };

                await webhook.send({
                    content: `m!p ${query}`,
                    username: member.displayName,
                    avatarURL: interaction.user.displayAvatarURL() || undefined,
                });

            } catch (error) {
                console.error('[MusicService] Error al usar el webhook para enviar el comando:', error);
                // Fallback: si el webhook falla, envía el comando como el bot.
                await channel.send(`m!p ${query}`);
            }
        } else if (channel instanceof DMChannel) {
            // Los webhooks no están disponibles en DMs, así que se envía directamente.
            await channel.send(`m!p ${query}`);
        }
    }

    /**
     * Simula la detención de la música.
     * @param interaction La interacción de botón que inició la detención.
     */
    public async stop(interaction: ButtonInteraction): Promise<void> {
        const userTag = this.getInteractionUserTag(interaction);
        console.log(`[MusicService] Solicitud de detención por ${userTag}`);
        const channel = interaction.channel;
        if (channel instanceof TextChannel || channel instanceof DMChannel) {
            await channel.send('m!leave');
        }
    }

    /**
     * Simula el salto a la siguiente canción.
     * @param interaction La interacción de botón que inició el salto.
     */
    public async skip(interaction: ButtonInteraction): Promise<void> {
        const userTag = this.getInteractionUserTag(interaction);
        console.log(`[MusicService] Solicitud de salto por ${userTag}`);
        const channel = interaction.channel;
        if (channel instanceof TextChannel || channel instanceof DMChannel) {
            await channel.send('m!next');
        }
    }
}

