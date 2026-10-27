import { EmbedBuilder } from 'discord.js';
import {
  MUSIC_COMMANDS,
  SUGGESTION_TIMEOUT_SECONDS,
} from '../utils/constants';

/**
 * Contexto del canal y del panel usado para generar la ayuda.
 */
export interface HelpContext {
  /** ID del canal configurado para el panel, o `null` si no hay panel. */
  panelChannelId: string | null;
  /** Indica si el panel está activo en el canal donde se pidió la ayuda. */
  panelActiveInChannel: boolean;
  /** Indica si la autodetección está activa en el canal donde se pidió la ayuda. */
  autodetectActive: boolean;
}

/**
 * Formatea el estado del panel para mostrarlo en la ayuda.
 * @param context Contexto del panel.
 * @returns Descripción del estado del panel.
 */
function formatPanelStatus(context: HelpContext): string {
  if (!context.panelChannelId) return 'No configurado';
  if (context.panelActiveInChannel) return 'Activo en este canal';
  return `Activo en <#${context.panelChannelId}>`;
}

/**
 * Formatea el estado de la autodetección en el canal actual.
 * @param context Contexto del canal.
 * @returns Descripción del estado de la autodetección.
 */
function formatAutodetectStatus(context: HelpContext): string {
  return context.autodetectActive
    ? 'Activada en este canal'
    : 'Desactivada en este canal';
}

/**
 * Construye las tarjetas públicas de ayuda.
 *
 * No incluye comandos de administración. El texto describe el funcionamiento
 * real del panel, las sugerencias y el botón de letras.
 *
 * @param context Estado actual del panel y de la autodetección.
 * @returns Tarjetas públicas de ayuda.
 */
export function buildPublicHelpEmbeds(context: HelpContext): EmbedBuilder[] {
  const overview = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📖 Guía rápida de Music to Easy')
    .setDescription(
      [
        '**Music to Easy no reproduce música.** Te ayuda a usar Jockie Music mediante un panel de comandos listos para copiar y pegar.',
        '',
        'El panel **no ejecuta comandos**: solo muestra el comando. Vos lo copiás y lo enviás al bot de música.',
        '',
        'Está optimizado para **Jockie Music**. Si usás otro bot, adaptá el prefijo y el comando.',
        '',
        '**Estado en este canal**',
        `• Panel: ${formatPanelStatus(context)}`,
        `• Sugerencias automáticas: ${formatAutodetectStatus(context)}`,
        '',
        'La configuración del panel está reservada a administradores.',
      ].join('\n')
    );

  const panel = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎛️ Cómo usar el panel')
    .setDescription(
      [
        `**Play** — \`${MUSIC_COMMANDS.PLAY}<canción o link>\``,
        `**Pausa** — \`${MUSIC_COMMANDS.PAUSE}\``,
        `**Stop** — \`${MUSIC_COMMANDS.STOP}\``,
        `**Siguiente** — \`${MUSIC_COMMANDS.SKIP}\``,
        `**Listado** — \`${MUSIC_COMMANDS.QUEUE}\``,
        '**Letra** — se habilita cuando hay una canción detectada.',
        '**Ayuda** — muestra esta guía.',
        '',
        'El panel se mantiene al final del canal y se reposiciona automáticamente.',
        '',
        'Los comandos corresponden a Jockie Music. Si usás otro bot, usá su prefijo y comando equivalente.',
      ].join('\n')
    );

  const extras = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle('✨ Sugerencias y letras')
    .setDescription(
      [
        '**Sugerencias automáticas**',
        `• Si escribís un link de YouTube o Spotify, o el nombre de una canción en un canal con el panel activo y la autodetección habilitada, el bot responde con \`${MUSIC_COMMANDS.PLAY.trim()} ...\` listo para copiar.`,
        `• La sugerencia se publica como respuesta en el canal, se autodestruye a los ${SUGGESTION_TIMEOUT_SECONDS} segundos y podés cerrarla con el botón **Cerrar**.`,
        '• Un administrador puede activar o desactivar esta función por canal.',
        '',
        '**Letra**',
        '• El botón se habilita cuando hay una canción sonando.',
        '• Publica la letra en el canal y agrega un botón **Cerrar**.',
        '• La letra se limpia al cambiar o terminar la canción.',
        '',
        '**Estado del bot**',
        '• Muestra la canción actual en Discord.',
      ].join('\n')
    );

  return [overview, panel, extras];
}

/**
 * Construye la tarjeta de ayuda para staff.
 *
 * Solo debe mostrarse a miembros con permiso de Administrador.
 *
 * @param context Estado actual del panel y de la autodetección.
 * @returns Tarjeta con los comandos de administración y el estado actual.
 */
export function buildStaffHelpEmbed(context: HelpContext): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('⚙️ Guía para staff')
    .setDescription(
      [
        'Estos comandos requieren **Administrador** y no se muestran en la ayuda pública.',
        '',
        '**Configuración**',
        '• `/music` — activa o reemplaza el panel en el canal actual.',
        '• `/disable` — desactiva el sistema en el servidor, elimina el panel configurado y la autodetección de ese canal.',
        '• `/autodetect` — activa las sugerencias automáticas en el canal actual. Requiere que el panel esté activo en ese canal.',
        '• `/disableautodetect` — desactiva las sugerencias en el canal actual y elimina las sugerencias activas.',
        '',
        '**Estado actual**',
        `• Panel: ${formatPanelStatus(context)}`,
        `• Autodetección en este canal: ${formatAutodetectStatus(context)}`,
        '',
        '**Permisos del bot**',
        '• Ver canales, Enviar mensajes, Insertar enlaces, Leer historial, Gestionar mensajes y Enviar mensajes en hilos.',
        '',
        'Al desactivar el panel también se elimina la configuración de autodetección del canal configurado.',
      ].join('\n')
    );
}
