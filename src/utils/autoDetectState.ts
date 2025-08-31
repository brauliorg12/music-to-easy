import fs from 'fs';
import path from 'path';

// Carpeta para persistencia
const DB_DIR = path.join(__dirname, '../../db');

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getStatePath(guildId: string, channelId: string): string {
  return path.join(DB_DIR, `autodetect-${guildId}-${channelId}.json`);
}

export function readAutoDetectState(guildId: string, channelId: string): boolean {
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

export function writeAutoDetectState(guildId: string, channelId: string, enabled: boolean) {
  ensureDbDir();
  const file = getStatePath(guildId, channelId);
  fs.writeFileSync(file, JSON.stringify({ enabled }, null, 2), 'utf-8');
}
