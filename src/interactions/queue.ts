import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class QueueHandler extends MusicCommandHandler {
    protected getCommand(): string {
        return MUSIC_COMMANDS.QUEUE;
    }

    protected getInstruction(): string {
        return '💡 Pégalo en el chat para ver la cola';
    }
}

const queueHandler = new QueueHandler();

export async function execute(interaction: ButtonInteraction) {
    await queueHandler.execute(interaction);
}
