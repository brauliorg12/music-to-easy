import {
  Message,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  TextChannel,
} from 'discord.js';
import { BotClient } from './BotClient';
import { createHelpMessage } from '../utils/helpMessage';
import BotState from '../utils/botState';

export class EventHandler {
  constructor(private client: BotClient) {}

  public setupEventHandlers(): void {
    this.client.once('ready', () => {
      console.log(
        `[Music to Easy] Bot iniciado como ${this.client.user?.tag}!`
      );
      this.logServerInfo();
    });

    this.client.on('messageCreate', this.handleMessageCreate.bind(this));
    this.client.on(
      'interactionCreate',
      this.handleInteractionCreate.bind(this)
    );
  }

  private logServerInfo(): void {
    const guilds = this.client.guilds.cache;
    const guildCount = guilds.size;

    if (guildCount === 0) {
      console.log('[Info] No está conectado a ningún servidor');
      return;
    }

    const serverWord = guildCount === 1 ? 'servidor' : 'servidores';
    console.log(`[Info] Monitoreando ${guildCount} ${serverWord}:`);

    guilds.forEach((guild) => {
      console.log(
        `  • ${guild.name} (ID: ${guild.id}) - ${guild.memberCount} miembros`
      );
    });
  }

  private async handleMessageCreate(message: Message): Promise<void> {
    const botState = BotState.getInstance();

    // Solo procesar si el sistema está activo
    if (!botState.getChannel()) return;

    // No procesar nuestros propios mensajes
    if (message.author.id === this.client.user?.id) return;

    // Solo procesar mensajes del canal configurado
    if (message.channelId !== botState.getChannel()) return;

    // Procesar mensajes de bots O comandos de usuarios (que inician con prefijo)
    const shouldReposition = this.shouldRepositionPanel(message);
    
    if (!shouldReposition) return;

    try {
      const channel = message.channel as TextChannel;

      // Intentar eliminar el mensaje anterior de ayuda
      await this.cleanupPreviousMessage(channel, botState);

      // Crear nuevo mensaje de ayuda
      const { embed, components } = createHelpMessage();
      const newHelpMessage = await channel.send({
        embeds: [embed],
        components: components,
      });

      // Guardar el ID del nuevo mensaje
      botState.setLastMessageId(newHelpMessage.id);

      this.logRepositioning(message, channel);
    } catch (error) {
      console.error('[Monitor] Error al reposicionar panel de ayuda:', error);
    }
  }

  private shouldRepositionPanel(message: Message): boolean {
    // Si es un bot, siempre reposicionar
    if (message.author.bot) {
      return true;
    }

    // Si es un usuario pero envió un comando de música, reposicionar
    const musicPrefixes = ['m!', '!', '?', '-', '.', '+', 'p!', 'd!', 'r!', '>'];
    const content = message.content.toLowerCase().trim();
    
    // Verificar si el mensaje comienza con algún prefijo común de bots de música
    const hasPrefix = musicPrefixes.some(prefix => content.startsWith(prefix));
    
    if (hasPrefix) {
      // Verificar si es un comando de música común
      const musicCommands = ['play', 'p', 'skip', 'next', 'stop', 'leave', 'queue', 'q', 'volume', 'vol', 'pause', 'resume'];
      const commandPart = content.split(' ')[0].substring(1); // Quitar prefijo
      
      return musicCommands.includes(commandPart);
    }

    return false;
  }

  private logRepositioning(message: Message, channel: TextChannel): void {
    const authorType = message.author.bot ? 'bot' : 'usuario';
    const authorName = message.author.tag;
    const messagePreview = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;

    if (message.author.bot) {
      console.log(
        `[Monitor] Panel reposicionado tras mensaje de bot ${authorName} en #${channel.name}`
      );
    } else {
      console.log(
        `[Monitor] Panel reposicionado tras comando de música de ${authorName} en #${channel.name}: "${messagePreview}"`
      );
    }
  }

  private async cleanupPreviousMessage(channel: TextChannel, botState: any): Promise<void> {
    const lastMessageId = botState.getLastMessageId();
    if (!lastMessageId) return;

    try {
      const oldMessage = await channel.messages.fetch(lastMessageId);
      await oldMessage.delete();
      console.log('[Monitor] Mensaje anterior eliminado correctamente');
    } catch (error: any) {
      // El mensaje ya no existe o no se pudo eliminar
      if (error.code === 10008) {
        console.log('[Monitor] El mensaje anterior ya fue eliminado');
      } else if (error.code === 50013) {
        console.log('[Monitor] Sin permisos para eliminar mensaje anterior');
      } else {
        console.log(`[Monitor] No se pudo eliminar mensaje anterior: ${error.message}`);
      }
    } finally {
      // Limpiar el ID siempre, independientemente del resultado
      botState.clearLastMessageId();
    }
  }

  private async handleInteractionCreate(
    interaction: Interaction
  ): Promise<void> {
    if (interaction.isCommand()) {
      await this.handleCommand(interaction as CommandInteraction);
    } else if (interaction.isButton()) {
      await this.handleButton(interaction as ButtonInteraction);
    } else if (interaction.isModalSubmit()) {
      await this.handleModal(interaction as ModalSubmitInteraction);
    }
  }

  private async handleCommand(interaction: CommandInteraction): Promise<void> {
    const command = this.client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(
        `[Advertencia] Comando desconocido: ${interaction.commandName}`
      );
      return;
    }

    try {
      await command.execute(interaction);
      console.log(
        `[Interacción] Comando '${interaction.commandName}' ejecutado por ${interaction.user.tag}.`
      );
    } catch (error) {
      console.error(
        `[ERROR] Error al ejecutar el comando '${interaction.commandName}':`,
        error
      );
      await this.sendErrorResponse(
        interaction,
        'Hubo un error al ejecutar este comando!'
      );
    }
  }

  private async handleButton(interaction: ButtonInteraction): Promise<void> {
    const buttonHandler = this.client.buttonInteractions.get(
      interaction.customId
    );
    if (!buttonHandler) {
      console.warn(
        `[Advertencia] Manejador de botón desconocido: ${interaction.customId}`
      );
      return;
    }

    try {
      await buttonHandler.execute(interaction);
      console.log(
        `[Interacción] Botón '${interaction.customId}' presionado por ${interaction.user.tag}.`
      );
    } catch (error) {
      console.error(
        `[ERROR] Error al manejar el botón '${interaction.customId}':`,
        error
      );
      await this.sendErrorResponse(
        interaction,
        'Hubo un error al procesar este botón!'
      );
    }
  }

  private async handleModal(
    interaction: ModalSubmitInteraction
  ): Promise<void> {
    const modalHandler = this.client.modalInteractions.get(
      interaction.customId
    );
    if (!modalHandler) {
      console.warn(
        `[Advertencia] Manejador de modal desconocido: ${interaction.customId}`
      );
      return;
    }

    try {
      await modalHandler.execute(interaction);
      console.log(
        `[Interacción] Modal '${interaction.customId}' enviado por ${interaction.user.tag}.`
      );
    } catch (error) {
      console.error(
        `[ERROR] Error al manejar el modal '${interaction.customId}':`,
        error
      );
      await this.sendErrorResponse(
        interaction,
        'Hubo un error al procesar este formulario!'
      );
    }
  }

  private async sendErrorResponse(
    interaction: any,
    content: string
  ): Promise<void> {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral: true });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
}
