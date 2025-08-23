import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class StopHandler extends MusicCommandHandler {
  protected getCommand(): string {
    return MUSIC_COMMANDS.STOP;
  }

  protected getInstruction(): string {
    return '💡 Pega en el chat para detener la música';
  }
}

const stopHandler = new StopHandler();

export async function execute(interaction: ButtonInteraction) {
  await stopHandler.execute(interaction);
}
