import {
  Message,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  TextChannel,
} from 'discord.js';
import { BotClient } from './BotClient';
import { MUSIC_BOT_PREFIXES, COMMON_MUSIC_COMMANDS } from '../utils/constants';
import { printLogo, printStartupInfo, logServerInfo } from '../utils/logs';
import { logPanelReposition } from '../utils/panelLogger';
import { cleanupAllHelpPanels } from '../utils/panelCleaner';
import { handleModal } from '../utils/modalHandler';
import { handleCommand } from '../utils/commandHandler';
import { handleButton } from '../utils/buttonHandler';
import {
  readPanelState,
  writePanelState,
  BotPanelState,
} from '../utils/stateManager';
import { repositionPanel } from '../utils/repositionPanel';
import fs from 'fs';
import path from 'path';
import { handleJockieMusicAnnouncement } from '../utils/jockieMusicAnnouncer';
import { isRelevantMusicBotMessage } from '../utils/musicBotEventHelpers';

export class EventHandler {
  constructor(private client: BotClient) {}

  /**
   * Registra los listeners principales de eventos de Discord para el bot.
   * - 'clientReady': Inicialización y reposición de paneles al conectar.
   * - 'messageCreate': Manejo de mensajes para paneles, comandos y anuncios de música.
   * - 'interactionCreate': Manejo de slash commands, botones y modales.
   * Este método es fundamental para que el bot reaccione a la actividad en Discord.
   */
  public setupEventHandlers(): void {
    this.client.once('clientReady', this.onReady.bind(this));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
  }

  /**
   * Evento que se ejecuta una sola vez cuando el bot está listo y conectado a Discord.
   * - Imprime el logo y la información de inicio.
   * - Muestra información de los servidores conectados.
   * - Reposiciona automáticamente los paneles de ayuda en todos los servidores donde el bot está presente,
   *   asegurando que el panel esté visible tras un reinicio.
   * - Limpia paneles viejos y actualiza el estado persistente.
   * Este método es clave para la experiencia de usuario y la persistencia del panel tras reinicios.
   */
  private async onReady(): Promise<void> {
    printLogo();
    printStartupInfo(this.client);
    logServerInfo(this.client);

    // Panel auto-reposición multi-servidor al iniciar
    const dbDir = path.resolve(__dirname, '../../db');
    if (!fs.existsSync(dbDir)) return;

    const files = fs
      .readdirSync(dbDir)
      .filter((f) => f.startsWith('bot-state-') && f.endsWith('.json'));
    for (const file of files) {
      try {
        const state: BotPanelState = JSON.parse(
          fs.readFileSync(path.join(dbDir, file), 'utf8')
        );
        if (!state.guildId || !state.channelId) continue;
        const guild = await this.client.guilds
          .fetch(state.guildId)
          .catch(() => null);
        if (!guild) continue;
        const channel = await this.client.channels
          .fetch(state.channelId)
          .catch(() => null);
        if (
          channel &&
          channel.isTextBased() &&
          'send' in channel &&
          typeof channel.send === 'function' &&
          channel.type === 0 // GuildText
        ) {
          await cleanupAllHelpPanels(
            this.client.user!.id,
            channel as TextChannel
          );
          // Usa repositionPanel para que el footer sea dinámico según autodetect
          const newPanel = await repositionPanel(
            channel as TextChannel,
            state.guildId,
            state.channelId
          );
          // Actualiza el estado con el nuevo mensaje
          writePanelState({
            guildId: state.guildId,
            channelId: state.channelId,
            lastHelpMessageId: newPanel.id,
          });
          console.log(
            `[Panel] Panel de comandos repuesto automáticamente en ${guild.name} (${guild.id}).`
          );
        }
      } catch (err) {
        console.warn(
          '[Panel] No se pudo reponer el panel automáticamente:',
          err
        );
      }
    }
  }

  private async onMessageCreate(message: Message): Promise<void> {
    // 1. Procesa eventos de bots de música (Jockie Music, etc.) y gestiona el panel y embeds especiales.
    await handleJockieMusicAnnouncement(message);

    // 2. Si el mensaje es de un bot de música relevante, evita reposicionar el panel aquí para no duplicar acciones.
    if (isRelevantMusicBotMessage(message)) {
      return;
    }

    // 3. Lógica de reposición de panel para comandos de usuario y otros eventos.
    if (!message.guild) return;
    const state = readPanelState(message.guild.id);
    if (!state?.channelId) return;
    if (message.author.id === this.client.user?.id) return;
    if (message.channelId !== state.channelId) return;

    if (!this.shouldRepositionPanel(message)) return;

    try {
      const channel = message.channel as TextChannel;
      await this.delay(500);

      // Limpia SOLO si el mensaje anterior existe y es diferente al actual
      if (state.lastHelpMessageId) {
        try {
          const lastMessage = await channel.messages.fetch(
            state.lastHelpMessageId
          );
          if (lastMessage) {
            await lastMessage.delete();
          }
        } catch {
          // El mensaje puede ya no existir, ignorar
        }
      }

      // Antes de crear el nuevo panel, verifica que no haya otro panel del bot en los últimos 5 mensajes
      const recentMessages = await channel.messages.fetch({ limit: 5 });
      const alreadyPanel = recentMessages.find(
        (msg) =>
          msg.author.id === this.client.user?.id &&
          msg.embeds.length > 0 &&
          msg.embeds[0].title?.includes('Comandos de Música')
      );
      if (alreadyPanel) {
        // Ya hay un panel, no crear otro
        return;
      }

      // Usa repositionPanel para que el footer sea dinámico según autodetect
      const newHelpMessage = await repositionPanel(
        channel,
        message.guild.id,
        state.channelId
      );
      writePanelState({
        guildId: message.guild.id,
        channelId: state.channelId,
        lastHelpMessageId: newHelpMessage.id,
      });
      logPanelReposition(message, channel);
    } catch (error) {
      console.error('[Monitor] Error al reposicionar panel de ayuda:', error);
    }
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

  private async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      await handleCommand(this.client, interaction as CommandInteraction);
    } else if (interaction.isButton()) {
      await handleButton(this.client, interaction as ButtonInteraction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(this.client, interaction as ModalSubmitInteraction);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
