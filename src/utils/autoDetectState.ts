import fs from 'fs';
import path from 'path';

// Carpeta para persistencia de estados de autodetección por canal
const DB_DIR = path.join(__dirname, '../../db');

/**
 * Asegura que la carpeta de base de datos exista.
 * Crea la carpeta si no existe.
 */
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

/**
 * Obtiene la ruta absoluta al archivo de estado de autodetección para un canal específico.
 * El archivo se nombra como "autodetect-<guildId>-<channelId>.json".
 * @param guildId ID del servidor (guild) de Discord.
 * @param channelId ID del canal de texto de Discord.
 * @returns Ruta absoluta al archivo de estado.
 */
function getStatePath(guildId: string, channelId: string): string {
  return path.join(DB_DIR, `autodetect-${guildId}-${channelId}.json`);
}

/**
 * Lee el estado de autodetección de un canal.
 * Devuelve true si la autodetección está habilitada, false si está deshabilitada o no existe.
 * @param guildId ID del servidor (guild) de Discord.
 * @param channelId ID del canal de texto de Discord.
 * @returns true si la autodetección está habilitada, false en caso contrario.
 */
export function readAutoDetectState(
  guildId: string,
  channelId: string
): boolean {
  ensureDbDir();
  const file = getStatePath(guildId, channelId);
  try {
    if (!fs.existsSync(file)) return false;
    const raw = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    return !!data.enabled;
  } catch {
    return false;
  }
}

/**
 * Escribe (guarda) el estado de autodetección de un canal.
 * Crea o actualiza el archivo correspondiente con el valor de "enabled".
 * @param guildId ID del servidor (guild) de Discord.
 * @param channelId ID del canal de texto de Discord.
 * @param enabled true para habilitar autodetección, false para deshabilitar.
 */
export function writeAutoDetectState(
  guildId: string,
  channelId: string,
  enabled: boolean
) {
  ensureDbDir();
  const file = getStatePath(guildId, channelId);
  fs.writeFileSync(file, JSON.stringify({ enabled }, null, 2), 'utf-8');
}
