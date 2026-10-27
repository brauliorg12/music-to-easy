/**
 * Identificadores de los botones personalizados.
 */
export const CUSTOM_IDS = {
  HELP: 'help',
  CLOSE: 'close', // Solo para mensajes ephemeral
  LYRICS: 'lyrics',
} as const;

/**
 * Prefijo del customId de los botones que cierran un grupo de letras.
 */
export const CLOSE_LYRICS_PREFIX = 'close_lyrics_';

/**
 * Comandos de música que se muestran en el panel.
 */
export const MUSIC_COMMANDS = {
  PLAY: 'm!p ',
  PAUSE: 'm!pause',
  STOP: 'm!leave',
  SKIP: 'm!next',
  QUEUE: 'm!queue',
} as const;

/**
 * Título del embed de sugerencia de comando.
 */
export const SUGGESTION_EMBED_TITLE = '🎵 Sugerencia de comando';

/**
 * Segundos tras los cuales una sugerencia de comando se elimina automáticamente.
 */
export const SUGGESTION_TIMEOUT_SECONDS = 60;

/**
 * Texto identificador del embed del panel de comandos.
 */
export const PANEL_EMBED_TITLE_MATCH = 'Comandos de Música';

/**
 * Título completo del embed del panel de comandos.
 */
export const PANEL_EMBED_TITLE = `🎵 ${PANEL_EMBED_TITLE_MATCH}`;

/**
 * Título del embed que anuncia la canción en reproducción.
 */
export const NOW_PLAYING_EMBED_TITLE = '🎶 ¡Ahora suena!';

/**
 * Título del embed de confirmación de letras publicadas.
 */
export const LYRICS_CONFIRMATION_EMBED_TITLE = 'Letra publicada en el canal';

/**
 * Prefijos comunes de bots de música.
 */
export const MUSIC_BOT_PREFIXES: string[] = [
  'm!',
  '!',
  '?',
  '-',
  '.',
  '+',
  'p!',
  'd!',
  'r!',
  '>',
  'fb!',
  'a!',
  'carl!',
  '=',
  '$',
  '&',
  '%',
  '~',
  '^',
  '/',
  'j!',
  'pan!',
  'c!',
  'g!',
  'chip!',
  'gb!',
];

/**
 * Comandos comunes de música.
 */
export const COMMON_MUSIC_COMMANDS: string[] = [
  'play',
  'p',
  'skip',
  'next',
  'stop',
  'leave',
  'disconnect',
  'queue',
  'q',
  'pause',
  'resume',
  'seek',
  'shuffle',
  'loop',
  'repeat',
  'lyrics',
  'nowplaying',
  'np',
  'clear',
  'remove',
  'jump',
  'move',
  'search',
  'join',
  'bass',
  'speed',
  'pitch',
  'nightcore',
  'vaporwave',
];
