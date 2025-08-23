import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class SkipHandler extends MusicCommandHandler {
  protected getCommand(): string {
    return MUSIC_COMMANDS.SKIP;
  }

  protected getInstruction(): string {
    return '💡 Pega en el chat para saltar a la siguiente canción';
  }
}

const skipHandler = new SkipHandler();

export async function execute(interaction: ButtonInteraction) {
  await skipHandler.execute(interaction);
}
