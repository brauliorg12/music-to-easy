import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class PlayHandler extends MusicCommandHandler {
  protected getCommand(): string {
    return MUSIC_COMMANDS.PLAY;
  }

  protected getInstruction(): string {
    return '💡 Pega en el chat + nombre/URL de canción, Reproduce música desde YouTube, Spotify, etc.';
  }
}

const playHandler = new PlayHandler();

export async function execute(interaction: ButtonInteraction) {
  await playHandler.execute(interaction);
}
