import {
  Message,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  VoiceState,
} from 'discord.js';
import type { PartialMessage } from 'discord.js';
import { BotClient } from './BotClient';
import { printLogo, printStartupInfo, logServerInfo } from '../utils/logs';
import { handleModal } from '../utils/modalHandler';
import { handleCommand } from '../utils/commandHandler';
import { handleButton } from '../utils/buttonHandler';
import { handleJockieMusicAnnouncement } from '../utils/jockieMusicAnnouncer';
import { handleMusicPanelEvents } from '../utils/musicPanelEvents';
import { onMessageDelete as lyricsOnMessageDelete } from '../lyrics/LyricsManager';
import { handleStartupPanelSync } from './startupHandler';
import { handlePanelRepositioning } from '../utils/panelRepositionHandler';
import { handleVoiceStateUpdate } from '../utils/voiceStateUpdateHandler';

export class EventHandler {
  constructor(private client: BotClient) {}

  /**
   * Registra los listeners principales de eventos de Discord para el bot.
   * - 'ready': Inicialización y reposición de paneles al conectar.
   * - 'messageCreate': Manejo de mensajes para paneles, comandos y anuncios de música.
   * - 'interactionCreate': Manejo de slash commands, botones y modales.
   * - 'messageDelete': Manejo de eliminación de mensajes (especialmente letras).
   * - 'voiceStateUpdate': Manejo de cambios en el estado de voz.
   * Este método es fundamental para que el bot reaccione a la actividad en Discord.
   */
  public setupEventHandlers(): void {
    this.client.once('ready', this.onReady.bind(this));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
    this.client.on('messageDelete', this.onMessageDelete.bind(this));
    this.client.on('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
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
    await handleStartupPanelSync(this.client);
  }

  /**
   * Se ejecuta con cada mensaje. Delega a los manejadores correspondientes.
   */
  private async onMessageCreate(message: Message): Promise<void> {
    // No procesar mensajes de otros bots para evitar bucles, excepto los de Jockie.
    if (
      message.author.bot &&
      !process.env.JOCKIE_MUSIC_IDS?.includes(message.author.id)
    ) {
      return;
    }

    const handledMusicAnnouncement = await handleJockieMusicAnnouncement(
      message
    );
    await handleMusicPanelEvents(message);

    // Solo reposicionar el panel si no se manejó un anuncio de música (inicio/fin/refresco)
    if (!handledMusicAnnouncement) {
      await handlePanelRepositioning(this.client, message);
    }
  }

  /**
   * Se ejecuta cuando se borra un mensaje. Delega al manejador de letras.
   */
  private async onMessageDelete(
    message: Message | PartialMessage
  ): Promise<void> {
    await lyricsOnMessageDelete(message, this.client.user?.id ?? '');
  }

  /**
   * Se ejecuta con cada cambio de estado de voz. Delega al manejador correspondiente.
   */
  private async onVoiceStateUpdate(
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    await handleVoiceStateUpdate(oldState, newState);
  }

  /**
   * Se ejecuta con cada interacción. Delega al manejador correspondiente según el tipo.
   */
  private async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      await handleCommand(this.client, interaction as CommandInteraction);
    } else if (interaction.isButton()) {
      await handleButton(this.client, interaction as ButtonInteraction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(this.client, interaction as ModalSubmitInteraction);
    }
  }
}
