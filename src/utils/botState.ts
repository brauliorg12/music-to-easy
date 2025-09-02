class BotState {
  private static instance: BotState;
  public musicHelpChannel: string | null = null;
  public lastHelpMessageId: string | null = null;
  private channelId: string | null = null;

  private constructor() {}

  /**
   * Devuelve la instancia única (singleton) de BotState.
   * Si no existe, la crea.
   * @returns Instancia única de BotState.
   */
  public static getInstance(): BotState {
    if (!BotState.instance) {
      BotState.instance = new BotState();
    }
    return BotState.instance;
  }

  /**
   * Establece el ID del canal de ayuda de música.
   * @param channelId ID del canal de texto donde se encuentra el panel de ayuda.
   */
  public setChannel(channelId: string): void {
    this.musicHelpChannel = channelId;
  }

  /**
   * Establece el ID del último mensaje de ayuda enviado.
   * @param messageId ID del mensaje de ayuda.
   */
  public setLastMessageId(messageId: string): void {
    this.lastHelpMessageId = messageId;
  }

  /**
   * Obtiene el ID del canal de ayuda de música actualmente guardado.
   * @returns ID del canal o null si no está definido.
   */
  public getChannel(): string | null {
    return this.musicHelpChannel;
  }

  /**
   * Obtiene el ID del último mensaje de ayuda enviado.
   * @returns ID del mensaje o null si no está definido.
   */
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
