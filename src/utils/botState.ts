class BotState {
  private static instance: BotState;
  public musicHelpChannel: string | null = null;
  public lastHelpMessageId: string | null = null;
  private channelId: string | null = null;

  private constructor() {}

  public static getInstance(): BotState {
    if (!BotState.instance) {
      BotState.instance = new BotState();
    }
    return BotState.instance;
  }

  public setChannel(channelId: string): void {
    this.musicHelpChannel = channelId;
  }

  public setLastMessageId(messageId: string): void {
    this.lastHelpMessageId = messageId;
  }

  public getChannel(): string | null {
    return this.musicHelpChannel;
  }

  public getLastMessageId(): string | null {
    return this.lastHelpMessageId;
  }

  public clearLastMessageId(): void {
    this.lastHelpMessageId = null;
  }

  public clearChannel(): void {
    this.musicHelpChannel = null;
  }

  public getChannelInfo(client?: any): {
    id: string | null;
    name: string | null;
  } {
    if (!this.channelId) {
      return { id: null, name: null };
    }

    if (client) {
      try {
        const channel = client.channels.cache.get(this.channelId);
        return {
          id: this.channelId,
          name: channel ? channel.name : 'Canal desconocido',
        };
      } catch {
        return { id: this.channelId, name: 'Canal no encontrado' };
      }
    }

    return { id: this.channelId, name: null };
  }
}

export default BotState;
