import { Message, TextChannel } from 'discord.js';
import { BotClient } from '../core/BotClient';
import { readPanelState, writePanelState } from './stateManager';
import { repositionPanel } from './repositionPanel';
import { logPanelReposition } from './panelLogger';
import { MUSIC_BOT_PREFIXES, COMMON_MUSIC_COMMANDS } from './constants';

/**
 * Determina si el panel de control debe ser reposicionado basado en el mensaje.
 * El panel se reposiciona si el mensaje es de un bot o si es un comando de música común.
 * @param message El mensaje que podría disparar la reposición.
 * @returns `true` si el panel debe ser reposicionado, `false` en caso contrario.
 */
function shouldRepositionPanel(message: Message): boolean {
  if (message.author.bot) return true;

  const content = message.content.toLowerCase().trim();
  const hasPrefix = MUSIC_BOT_PREFIXES.some((prefix) =>
    content.startsWith(prefix)
  );

  if (hasPrefix) {
    const commandPart = content.split(' ')[0].substring(1);
    return COMMON_MUSIC_COMMANDS.includes(commandPart);
  }

  return false;
}

/**
 * Maneja la lógica de reposicionamiento del panel de control en respuesta a nuevos mensajes.
 * Si un mensaje relevante es enviado en el canal del panel, el panel se mueve al final del chat.
 * @param client El cliente del bot.
 * @param message El mensaje que podría disparar la reposición.
 */
export async function handlePanelRepositioning(
  client: BotClient,
  message: Message
): Promise<void> {
  if (!message.guild) return;

  const state = readPanelState(message.guild.id);
  if (!state?.channelId || message.channelId !== state.channelId) return;

  // No reposicionar si el mensaje es del propio bot o si no es un comando relevante.
  if (
    message.author.id === client.user?.id ||
    !shouldRepositionPanel(message)
  ) {
    return;
  }

  try {
    const channel = message.channel as TextChannel;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Pequeño delay

    // Borra el panel anterior si existe.
    if (state.lastHelpMessageId) {
      try {
        const lastMessage = await channel.messages.fetch(
          state.lastHelpMessageId
        );
        await lastMessage.delete();
      } catch {
        // Ignorar si el mensaje ya no existe.
      }
    }

    // Vuelve a enviar el panel al final del canal.
    const newHelpMessage = await repositionPanel(
      channel,
      message.guild.id,
      state.channelId
    );

    writePanelState({
      guildId: message.guild.id,
      channelId: state.channelId,
      lastHelpMessageId: newHelpMessage.id,
    });

    logPanelReposition(message, channel);
  } catch (error) {
    console.error('[Monitor] Error al reposicionar panel de ayuda:', error);
  }
}
