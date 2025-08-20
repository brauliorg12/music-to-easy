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

    // Procesar mensajes que requieren reposicionamiento
    const shouldReposition = this.shouldRepositionPanel(message);

    if (!shouldReposition) return;

    try {
      const channel = message.channel as TextChannel;

      // Pequeño delay para evitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Limpiar mensajes anteriores de nuestra app
      await this.cleanupPreviousMessages(channel, botState);

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

  private async cleanupPreviousMessages(channel: TextChannel, botState: any): Promise<void> {
    try {
      // Obtener los últimos mensajes del canal
      const messages = await channel.messages.fetch({ limit: 20 });
      
      // Filtrar mensajes de nuestra app
      const ourMessages = messages.filter(msg => 
        msg.author.id === this.client.user?.id && 
        msg.embeds.length > 0 && 
        msg.embeds[0].title?.includes('Comandos de Música')
      );

      // Eliminar todos nuestros mensajes de ayuda anteriores
      for (const ourMessage of ourMessages.values()) {
        try {
          await ourMessage.delete();
          console.log('[Monitor] Mensaje anterior de ayuda eliminado');
        } catch (error: any) {
          // Ignorar errores de mensajes ya eliminados
          if (error.code !== 10008) {
            console.log(`[Monitor] No se pudo eliminar mensaje: ${error.message}`);
          }
        }
      }

      // También limpiar el mensaje específico del estado si existe
      const lastMessageId = botState.getLastMessageId();
      if (lastMessageId) {
        try {
          const oldMessage = await channel.messages.fetch(lastMessageId);
          await oldMessage.delete();
          console.log('[Monitor] Mensaje del estado eliminado correctamente');
        } catch (error: any) {
          // Ya manejado en el bucle anterior
        }
      }
      
    } catch (error: any) {
      console.log(`[Monitor] Error en limpieza masiva: ${error.message}`);
      
      // Fallback: limpiar solo el mensaje del estado
      const lastMessageId = botState.getLastMessageId();
      if (lastMessageId) {
        try {
          const oldMessage = await channel.messages.fetch(lastMessageId);
          await oldMessage.delete();
        } catch (error: any) {
          // Ignorar errores
        }
      }
    } finally {
      // Limpiar el ID siempre
      botState.clearLastMessageId();
    }
  }

  private shouldRepositionPanel(message: Message): boolean {
    // TODOS los bots siempre activan reposicionamiento
    if (message.author.bot) {
      return true;
    }

    // Si es un usuario pero envió un comando de música, también reposicionar
    const content = message.content.toLowerCase().trim();

    // Verificar si el mensaje comienza con algún prefijo común de bots de música
    const hasPrefix = MUSIC_BOT_PREFIXES.some((prefix) =>
      content.startsWith(prefix)
    );

    if (hasPrefix) {
      // Verificar si es un comando de música común
      const commandPart = content.split(' ')[0].substring(1); // Quitar prefijo
      return COMMON_MUSIC_COMMANDS.includes(commandPart);
    }

    return false;
  }

  private logRepositioning(message: Message, channel: TextChannel): void {
    const authorName = message.author.tag;

    if (message.author.bot) {
      // Detectar tipo de mensaje del bot
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

      // Identificar si es un bot de música conocido
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
