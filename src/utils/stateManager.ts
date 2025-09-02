import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(__dirname, '../../db');

export interface BotPanelState {
  guildId: string;
  channelId: string | null;
  lastHelpMessageId: string | null;
}

/**
 * Obtiene la ruta absoluta al archivo de estado del panel para un servidor (guild).
 * El archivo se nombra como "bot-state-<guildId>.json".
 * Si la carpeta no existe, la crea.
 * @param guildId ID del servidor (guild) de Discord.
 * @returns Ruta absoluta al archivo de estado.
 */
export function getStateFilePath(guildId: string): string {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  return path.join(DB_DIR, `bot-state-${guildId}.json`);
}

/**
 * Lee el estado del panel de ayuda para un servidor.
 * Devuelve el objeto con guildId, channelId y lastHelpMessageId, o null si no existe.
 * @param guildId ID del servidor (guild) de Discord.
 * @returns Estado del panel o null si no existe.
 */
export function readPanelState(guildId: string): BotPanelState | null {
  const file = getStateFilePath(guildId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Escribe (guarda) el estado del panel de ayuda para un servidor.
 * Crea o actualiza el archivo correspondiente con los datos del panel.
 * @param state Objeto con guildId, channelId y lastHelpMessageId.
 */
export function writePanelState(state: BotPanelState): void {
  const file = getStateFilePath(state.guildId);
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Lee todos los estados de paneles guardados en la base de datos.
 * Devuelve un array con los datos de cada panel encontrado.
 * @returns Array de objetos con guildId, channelId y lastHelpMessageId.
 */
export function readAllPanelStates(): Array<{
  guildId: string;
  channelId: string;
  lastHelpMessageId?: string;
}> {
  if (!fs.existsSync(DB_DIR)) return [];
  const files = fs
    .readdirSync(DB_DIR)
    .filter((f) => f.startsWith('bot-state-') && f.endsWith('.json'));
  const states: Array<{
    guildId: string;
    channelId: string;
    lastHelpMessageId?: string;
  }> = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DB_DIR, file), 'utf8'));
      if (data.guildId && data.channelId) {
        states.push({
          guildId: data.guildId,
          channelId: data.channelId,
          lastHelpMessageId: data.lastHelpMessageId,
        });
      }
    } catch {}
  }
  return states;
}
