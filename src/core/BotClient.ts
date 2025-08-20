import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { CommandLoader } from './CommandLoader';
import { InteractionLoader } from './InteractionLoader';
import { EventHandler } from './EventHandler';

/**
 * Music to Easy - Discord Bot
 * Extended Discord Client with additional collections for interactions
 */
export class BotClient extends Client {
  public commands: Collection<string, any> = new Collection();
  public buttonInteractions: Collection<string, any> = new Collection();
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

  private initialize(): void {
    this.commandLoader.loadCommands();
    this.interactionLoader.loadInteractions();
    this.eventHandler.setupEventHandlers();
  }
}
