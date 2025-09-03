export const CUSTOM_IDS = {
  HELP: 'help',
  CLOSE: 'close', // Solo para mensajes ephemeral
  LYRICS: 'lyrics',
} as const;

export const MUSIC_COMMANDS = {
  PLAY: 'm!p ',
  STOP: 'm!leave',
  SKIP: 'm!next',
  QUEUE: 'm!queue',
} as const;

// Bots de música comunes para detección específica
export const COMMON_MUSIC_BOTS: string[] = [
  '159985870458322944', // MEE6
  '235088799074484224', // Rythm
  '252128902418268161', // Groovy
  '472911936951156740', // FredBoat
  '184405311681986560', // Dyno
  '155149108183695360', // Dank Memer
  '234395307759108106', // Arcane
  '213466096718708737', // Craig
  '411916947773587456', // Jockie Music
  '298822483325083649', // Probot
  '270198738570379264', // Pancake
  '473370418683797504', // Green-bot
  '569621644344246284', // Chip
  '307926710034357248', // Carl-bot (música)
  '282859044593598464', // GiveawayBot
  // Agregar más IDs según necesites
];

// Prefijos comunes de bots de música
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

// Comandos comunes de música
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
