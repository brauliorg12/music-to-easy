import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { CUSTOM_IDS } from '../utils/constants';
import { readAutoDetectState } from '../utils/autoDetectState';
import { readPanelState } from '../utils/stateManager';
import { buildVersionFooter } from '../utils/botVersion';
import {
  buildPublicHelpEmbeds,
  buildStaffHelpEmbed,
} from '../content/helpCards';
import type { HelpContext } from '../content/helpCards';

/**
 * Indica si el miembro puede ver la guía de staff.
 *
 * Usa los permisos que ya vienen en la interacción: no hace fetch de miembros
 * ni consulta la API de Discord. Los comandos de administración declaran
 * `Administrator` como permiso por defecto.
 *
 * @param interaction Interacción del botón de ayuda.
 * @returns `true` si el miembro tiene permiso de Administrador.
 */
function canSeeStaffHelp(interaction: ButtonInteraction): boolean {
  return (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ??
    false
  );
}

/**
 * Construye el contexto de ayuda a partir del estado persistido del panel
 * y de la autodetección en el canal actual.
 *
 * @param interaction Interacción del botón de ayuda.
 * @returns Contexto con el estado del panel y de la autodetección.
 */
function buildHelpContext(interaction: ButtonInteraction): HelpContext {
  const guildId = interaction.guildId;
  const channelId = interaction.channelId;
  const panelState = guildId ? readPanelState(guildId) : null;
  const panelChannelId = panelState?.channelId ?? null;
  const panelActiveInChannel =
    panelChannelId !== null && panelChannelId === channelId;
  const autodetectActive =
    guildId !== null &&
    channelId !== null &&
    readAutoDetectState(guildId, channelId);

  return {
    panelChannelId,
    panelActiveInChannel,
    autodetectActive,
  };
}

/**
 * Maneja el botón "Ayuda" del panel.
 *
 * Muestra la guía pública y agrega la guía de staff solo si el miembro tiene
 * permiso de Administrador. El mensaje es efímero y solo lo ve quien lo pidió.
 *
 * @param interaction Interacción del botón "Ayuda".
 */
export async function execute(interaction: ButtonInteraction): Promise<void> {
  try {
    const context = buildHelpContext(interaction);
    const embeds = buildPublicHelpEmbeds(context);

    if (canSeeStaffHelp(interaction)) {
      embeds.push(buildStaffHelpEmbed(context));
    }

    const lastEmbed = embeds[embeds.length - 1];
    lastEmbed?.setFooter({ text: buildVersionFooter() });

    const closeButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CLOSE)
      .setLabel('Cerrar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    await interaction.reply({
      embeds,
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('[Help] Error al mostrar la ayuda:', error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Hubo un error al mostrar la ayuda.',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: 'Hubo un error al mostrar la ayuda.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
