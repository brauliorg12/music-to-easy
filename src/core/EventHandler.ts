import {
  Message,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  TextChannel,
  Guild,
} from 'discord.js';
import { BotClient } from './BotClient';
import { createHelpMessage } from '../utils/helpMessage';
import {
  MUSIC_BOT_PREFIXES,
  COMMON_MUSIC_COMMANDS,
} from '../utils/constants';
import { printLogo, printStartupInfo, logServerInfo } from '../utils/logs';
import { logPanelReposition } from '../utils/panelLogger';
import { cleanupAllHelpPanels } from '../utils/panelCleaner';
import { handleModal } from '../utils/modalHandler';
import { handleCommand } from '../utils/commandHandler';
import { handleButton } from '../utils/buttonHandler';
import { readPanelState, writePanelState, BotPanelState } from '../utils/stateManager';
import fs from 'fs';
import path from 'path';

export class EventHandler {
  constructor(private client: BotClient) {}

  public setupEventHandlers(): void {
    this.client.once('clientReady', this.onReady.bind(this));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
  }

  private async onReady(): Promise<void> {
    printLogo();
    printStartupInfo(this.client);
    logServerInfo(this.client);

    // Panel auto-reposición multi-servidor al iniciar
    const dbDir = path.resolve(__dirname, '../../db');
    if (!fs.existsSync(dbDir)) return;

    const files = fs.readdirSync(dbDir).filter(f => f.startsWith('bot-state-') && f.endsWith('.json'));
    for (const file of files) {
      try {
        const state: BotPanelState = JSON.parse(fs.readFileSync(path.join(dbDir, file), 'utf8'));
        if (!state.guildId || !state.channelId) continue;
        const guild = await this.client.guilds.fetch(state.guildId).catch(() => null);
        if (!guild) continue;
        const channel = await this.client.channels.fetch(state.channelId).catch(() => null);
        if (
          channel &&
          channel.isTextBased() &&
          'send' in channel &&
          typeof channel.send === 'function' &&
          channel.type === 0 // GuildText
        ) {
          await cleanupAllHelpPanels(this.client.user!.id, channel as TextChannel);
          const { embed, components } = createHelpMessage();
          const newPanel = await channel.send({ embeds: [embed], components });
          // Actualiza el estado con el nuevo mensaje
          writePanelState({
            guildId: state.guildId,
            channelId: state.channelId,
            lastHelpMessageId: newPanel.id,
          });
          console.log(`[Panel] Panel de comandos repuesto automáticamente en ${guild.name} (${guild.id}).`);
        }
      } catch (err) {
        console.warn('[Panel] No se pudo reponer el panel automáticamente:', err);
      }
    }
  }

  private async onMessageCreate(message: Message): Promise<void> {
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
          const lastMessage = await channel.messages.fetch(state.lastHelpMessageId);
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

      const { embed, components } = createHelpMessage();
      const newHelpMessage = await channel.send({
        embeds: [embed],
        components,
      });
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
