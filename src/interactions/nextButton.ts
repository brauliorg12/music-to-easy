import { ButtonInteraction } from 'discord.js';

import { MusicService } from '../core/musicService';

export async function execute(interaction: ButtonInteraction) {
    const musicService = MusicService.getInstance();
    await musicService.skip(interaction);
    await interaction.deferUpdate();
}
