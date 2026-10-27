import { getClient } from '../globalClient';

let lastActivityText: string | null = null;
let lastActivityType: number | null = null;

/**
 * Actualiza la actividad del bot en Discord.
 * Evita llamadas repetidas cuando el texto y el tipo no cambiaron.
 * @param text Texto a mostrar como estado.
 * @param type Tipo de actividad de Discord (2 = Listening, 3 = Watching, etc.).
 */
export function setBotActivity(text: string, type: number = 2): void {
  if (text === lastActivityText && type === lastActivityType) {
    return;
  }

  const client = getClient();
  if (!client || !client.user) {
    console.warn(
      '[MusicToEasy] No se pudo setear la actividad: cliente o usuario no disponible.'
    );
    return;
  }

  client.user.setActivity(text, { type });
  client.currentActivityType = type;
  lastActivityText = text;
  lastActivityType = type;
}
