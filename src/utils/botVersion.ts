import fs from 'fs';
import path from 'path';

/**
 * Lee la versión declarada en el package.json del proyecto.
 * Si el archivo no se puede leer o no tiene versión, devuelve `dev`.
 * @returns Versión del bot.
 */
function readBotVersion(): string {
  try {
    const packagePath = path.resolve(__dirname, '../../package.json');
    const raw = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(raw) as { version?: string };
    return packageJson.version?.trim() || 'dev';
  } catch {
    return 'dev';
  }
}

/**
 * Versión actual del bot, leída una sola vez al iniciar el proceso.
 */
export const BOT_VERSION = readBotVersion();

/**
 * Construye el texto de autoría y versión para los pies de las tarjetas.
 * @returns Texto listo para usar en `setFooter`.
 */
export function buildVersionFooter(): string {
  return `by Burlon23 - CubaNova - version: ${BOT_VERSION}`;
}
