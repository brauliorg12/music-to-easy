import { ModalSubmitInteraction } from 'discord.js';

import { MusicService } from '../core/musicService';
import { CUSTOM_IDS } from '../utils/constants';

export async function execute(interaction: ModalSubmitInteraction) {
    const song = interaction.fields.getTextInputValue(CUSTOM_IDS.PLAY_MODAL_INPUT);
    const musicService = MusicService.getInstance();
    await musicService.play(interaction, song);
    // Acusa recibo de la interacción para cerrar el modal sin enviar un mensaje de respuesta.
    await interaction.deferUpdate();
}
