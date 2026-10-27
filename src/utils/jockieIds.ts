const jockieBotIds: readonly string[] = (process.env.JOCKIE_MUSIC_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const jockieBotIdSet = new Set(jockieBotIds);

/**
 * Devuelve los IDs de los bots de música configurados en `JOCKIE_MUSIC_IDS`.
 * @returns Lista inmutable con los IDs configurados.
 */
export function getJockieBotIds(): readonly string[] {
  return jockieBotIds;
}

/**
 * Indica si un ID corresponde a un bot de música configurado.
 * @param id ID de usuario de Discord a evaluar.
 * @returns `true` si el ID pertenece a un bot de música configurado.
 */
export function isJockieBotId(id: string): boolean {
  return jockieBotIdSet.has(id);
}
