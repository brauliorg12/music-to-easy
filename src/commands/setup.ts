import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Crea el panel de control de música en este canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Panel de Control de Música')
        .setDescription('Usa los botones de abajo para controlar la música.')
        .setTimestamp();

    const playButton = new ButtonBuilder()
        .setCustomId('play_button')
        .setLabel('▶️ Play')
        .setStyle(ButtonStyle.Success);

    const stopButton = new ButtonBuilder()
        .setCustomId('stop_button')
        .setLabel('⏹️ Stop')
        .setStyle(ButtonStyle.Danger);

    const nextButton = new ButtonBuilder()
        .setCustomId('next_button')
        .setLabel('⏭️ Next')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(playButton, stopButton, nextButton);

    await interaction.reply({ embeds: [embed], components: [row] });
}
