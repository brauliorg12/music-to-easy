import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(__dirname, '../../db');

export interface BotPanelState {
  guildId: string;
  channelId: string | null;
  lastHelpMessageId: string | null;
}

export function getStateFilePath(guildId: string): string {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  return path.join(DB_DIR, `bot-state-${guildId}.json`);
}

export function readPanelState(guildId: string): BotPanelState | null {
  const file = getStateFilePath(guildId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function writePanelState(state: BotPanelState): void {
  const file = getStateFilePath(state.guildId);
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
}
