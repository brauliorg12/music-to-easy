import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class VolumeHandler extends MusicCommandHandler {
    protected getCommand(): string {
        return MUSIC_COMMANDS.VOLUME;
    }

    protected getInstruction(): string {
        return '💡 Pégalo en el chat + número (1-100)';
    }
}

const volumeHandler = new VolumeHandler();

export async function execute(interaction: ButtonInteraction) {
    await volumeHandler.execute(interaction);
}
