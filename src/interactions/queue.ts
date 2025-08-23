import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class QueueHandler extends MusicCommandHandler {
  protected getCommand(): string {
    return MUSIC_COMMANDS.QUEUE;
  }

  protected getInstruction(): string {
    return '💡 Pega en el chat para ver la cola de reproducción';
  }
}

const queueHandler = new QueueHandler();

export async function execute(interaction: ButtonInteraction) {
  await queueHandler.execute(interaction);
}
