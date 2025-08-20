class BotState {
  private static instance: BotState;
  public musicHelpChannel: string | null = null;
  public lastHelpMessageId: string | null = null;

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
}

export default BotState;
