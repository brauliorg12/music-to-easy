import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';

export async function execute(interaction: ButtonInteraction) {

    const modal = new ModalBuilder()
        .setCustomId(CUSTOM_IDS.PLAY_MODAL)
        .setTitle('Reproducir Música');

    const songInput = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.PLAY_MODAL_INPUT)
        .setLabel('URL o nombre de la canción')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(songInput);

    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
