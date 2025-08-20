export const CUSTOM_IDS = {
  PLAY: 'play',
  STOP: 'stop',
  SKIP: 'skip',
  QUEUE: 'queue',
  VOLUME: 'volume',
  CLOSE: 'close' // Solo para mensajes ephemeral
} as const;

export const MUSIC_COMMANDS = {
  PLAY: 'm!p ',
  STOP: 'm!leave',
  SKIP: 'm!next',
  QUEUE: 'm!queue',
  VOLUME: 'm!volume '
} as const;

// Bots de música comunes para detección específica
export const COMMON_MUSIC_BOTS = [
  '159985870458322944', // MEE6
  '235088799074484224', // Rythm
  '252128902418268161', // Groovy
  '472911936951156740', // FredBoat
  '184405311681986560', // Dyno
  '155149108183695360', // Dank Memer
  '234395307759108106', // Arcane
  '213466096718708737', // Craig
  '411916947773587456', // Jockie Music#8158
  // Agregar más IDs según necesites
] as const;

// Prefijos comunes de bots de música
export const MUSIC_BOT_PREFIXES = [
  'm!', '!', '?', '-', '.', '+', 'p!', 'd!', 'r!', '>', 
  'fb!', 'a!', 'carl!', '=', '$', '&', '%', '~', '^'
] as const;

// Comandos comunes de música
export const COMMON_MUSIC_COMMANDS = [
  'play', 'p', 'skip', 'next', 'stop', 'leave', 'disconnect',
  'queue', 'q', 'volume', 'vol', 'pause', 'resume', 'seek',
  'shuffle', 'loop', 'repeat', 'lyrics', 'nowplaying', 'np',
  'clear', 'remove', 'jump', 'move', 'search', 'join'
] as const;
