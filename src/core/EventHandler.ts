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
import {
  COMMON_MUSIC_BOTS,
  MUSIC_BOT_PREFIXES,
  COMMON_MUSIC_COMMANDS,
} from '../utils/constants';

export class EventHandler {
  constructor(private client: BotClient) {}

  public setupEventHandlers(): void {
    this.client.once('ready', this.onReady.bind(this));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
  }

  private onReady(): void {
    this.printLogo();
    this.printStartupInfo();
    this.logServerInfo();
  }

  private printLogo(): void {
    console.log(`
\x1b[36m  
        🎵  Music to Easy - Discord Bot 🎵
        by Burlon23
\x1b[0m
    `);
  }

  private printStartupInfo(): void {
    const userTag = this.client.user?.tag;
    const botState = BotState.getInstance();
    const channelId = botState.getChannel();
    let channelInfo = 'Canal configurado: (no configurado)';
    if (channelId) {
      const channel = this.client.channels.cache.get(channelId);
      if (channel && 'name' in channel) {
        channelInfo = `Canal configurado: #${channel.name} (${channel.id})`;
      } else {
        channelInfo = `Canal configurado: (no encontrado, id=${channelId})`;
      }
    }
    const now = new Date();
    const fechaLocal = now.toLocaleString();
    const fechaUTC = now.toISOString();

    console.log('\x1b[32m%s\x1b[0m', '🟢 Conectado');
    console.log(`[App] Nombre: Music to Easy`);
    console.log(`[App] Usuario Discord: ${userTag}`);
    console.log(`[App] Inicio: ${fechaLocal} (local) | ${fechaUTC} (UTC)`);
    console.log(`[App] ${channelInfo}`);
  }

  private async onMessageCreate(message: Message): Promise<void> {
    const botState = BotState.getInstance();
    if (!botState.getChannel()) return;
    if (message.author.id === this.client.user?.id) return;
    if (message.channelId !== botState.getChannel()) return;
    if (!this.shouldRepositionPanel(message)) return;

    try {
      const channel = message.channel as TextChannel;
      await this.delay(500);

      // Nueva lógica: limpiar TODOS los paneles previos antes de enviar uno nuevo
      await this.cleanupAllHelpPanels(channel);

      const { embed, components } = createHelpMessage();
      const newHelpMessage = await channel.send({
        embeds: [embed],
        components,
      });
      botState.setLastMessageId(newHelpMessage.id);
      this.logPanelReposition(message, channel);
    } catch (error) {
      console.error('[Monitor] Error al reposicionar panel de ayuda:', error);
    }
  }

  // Limpia todos los mensajes de panel de ayuda del bot en el canal
  private async cleanupAllHelpPanels(channel: TextChannel): Promise<void> {
    try {
      const messages = await channel.messages.fetch({ limit: 30 });
      const helpPanels = messages.filter(
        (msg) =>
          msg.author.id === this.client.user?.id &&
          msg.embeds.length > 0 &&
          msg.embeds[0].title?.includes('Comandos de Música')
      );
      for (const panel of helpPanels.values()) {
        try {
          await panel.delete();
        } catch {}
      }
    } catch {}
  }

  private shouldRepositionPanel(message: Message): boolean {
    if (message.author.bot) return true;
    const content = message.content.toLowerCase().trim();
    const hasPrefix = MUSIC_BOT_PREFIXES.some((prefix) =>
      content.startsWith(prefix)
    );
    if (hasPrefix) {
      const commandPart = content.split(' ')[0].substring(1);
      return COMMON_MUSIC_COMMANDS.includes(commandPart);
    }
    return false;
  }

  private async cleanupHelpMessages(
    channel: TextChannel,
    botState: any
  ): Promise<void> {
    try {
      const messages = await channel.messages.fetch({ limit: 20 });
      const ourMessages = messages.filter(
        (msg) =>
          msg.author.id === this.client.user?.id &&
          msg.embeds.length > 0 &&
          msg.embeds[0].title?.includes('Comandos de Música')
      );
      for (const ourMessage of ourMessages.values()) {
        try {
          await ourMessage.delete();
          console.log('[Monitor] Mensaje anterior de ayuda eliminado');
        } catch (error: any) {
          if (error.code !== 10008) {
            console.log(
              `[Monitor] No se pudo eliminar mensaje: ${error.message}`
            );
          }
        }
      }
      await this.deleteLastMessageById(channel, botState.getLastMessageId());
    } catch (error: any) {
      console.log(`[Monitor] Error en limpieza masiva: ${error.message}`);
      await this.deleteLastMessageById(channel, botState.getLastMessageId());
    } finally {
      botState.clearLastMessageId();
    }
  }

  private async deleteLastMessageById(
    channel: TextChannel,
    messageId?: string
  ) {
    if (!messageId) return;
    try {
      const oldMessage = await channel.messages.fetch(messageId);
      await oldMessage.delete();
      console.log('[Monitor] Mensaje del estado eliminado correctamente');
    } catch {
      // Ignorar errores
    }
  }

  private logPanelReposition(message: Message, channel: TextChannel): void {
    const authorName = message.author.tag;
    if (message.author.bot) {
      let messageType = 'mensaje';
      let contentPreview = '';
      if (message.embeds.length > 0) {
        messageType = 'embed';
        const embed = message.embeds[0];
        if (embed.title) {
          contentPreview = `"${embed.title}"`;
        } else if (embed.description) {
          contentPreview = `"${embed.description.substring(0, 50)}${
            embed.description.length > 50 ? '...' : ''
          }"`;
        }
      } else if (message.content) {
        contentPreview = `"${message.content.substring(0, 50)}${
          message.content.length > 50 ? '...' : ''
        }"`;
      }
      const knownMusicBot = COMMON_MUSIC_BOTS.includes(message.author.id);
      const botType = knownMusicBot ? 'bot de música' : 'bot';
      console.log(
        `[Monitor] Panel reposicionado tras ${messageType} de ${botType} ${authorName} en #${
          channel.name
        }${contentPreview ? ': ' + contentPreview : ''}`
      );
    } else {
      const messagePreview =
        message.content.length > 50
          ? message.content.substring(0, 50) + '...'
          : message.content;
      console.log(
        `[Monitor] Panel reposicionado tras comando de música de usuario ${authorName} en #${channel.name}: "${messagePreview}"`
      );
    }
  }

  private async onInteractionCreate(interaction: Interaction): Promise<void> {
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public logServerInfo(): void {
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
}
