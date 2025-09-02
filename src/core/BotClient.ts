import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { CommandLoader } from './CommandLoader';
import { InteractionLoader } from './InteractionLoader';
import { EventHandler } from './EventHandler';

/**
 * Clase principal del bot "Music to Easy".
 * Extiende el cliente de Discord.js y agrega colecciones para comandos, botones y modales.
 * Se encarga de cargar comandos, interacciones y eventos al inicializarse.
 */
export class BotClient extends Client {
  // Colección de comandos slash (por nombre)
  public commands: Collection<string, any> = new Collection();
  // Colección de manejadores de botones (por customId)
  public buttonInteractions: Collection<string, any> = new Collection();
  // Colección de manejadores de modales (por customId)
  public modalInteractions: Collection<string, any> = new Collection();

  private commandLoader: CommandLoader;
  private interactionLoader: InteractionLoader;
  private eventHandler: EventHandler;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commandLoader = new CommandLoader(this);
    this.interactionLoader = new InteractionLoader(this);
    this.eventHandler = new EventHandler(this);

    this.initialize();
  }

  /**
   * Inicializa el bot cargando comandos, interacciones y eventos.
   * Se llama automáticamente en el constructor.
   */
  private initialize(): void {
    this.commandLoader.loadCommands();
    this.interactionLoader.loadInteractions();
    this.eventHandler.setupEventHandlers();
  }
}
