import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { createHelpMessage } from '../utils/helpMessage';
import BotState from '../utils/botState';

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Activa el sistema de ayuda de música en este canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    const botState = BotState.getInstance();
    
    // Guardar el ID del canal en el estado del bot
    botState.setChannel(interaction.channelId);
    
    // Enviar mensaje inicial de ayuda
    const { embed, components } = createHelpMessage();
    
    // Primero responder a la interacción
    await interaction.reply({ 
        embeds: [embed], 
        components: components
    });
    
    // Luego obtener la respuesta para conseguir el ID del mensaje
    const message = await interaction.fetchReply();
    
    // Guardar ID del último mensaje de ayuda
    botState.setLastMessageId(message.id);
    
    console.log(`[Setup] Sistema activado en canal ${interaction.channelId}`);
}
