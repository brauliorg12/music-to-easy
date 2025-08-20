import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class VolumeHandler extends MusicCommandHandler {
  protected getCommand(): string {
    return MUSIC_COMMANDS.VOLUME + '<1-100>';
  }

  protected getInstruction(): string {
    return '💡 Pégalo en el chat + número del 1 al 100 para ajustar volumen';
  }
}

const volumeHandler = new VolumeHandler();

export async function execute(interaction: ButtonInteraction) {
  await volumeHandler.execute(interaction);
}
