import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { createHelpMessage } from './helpMessage';
import { writePanelState, readPanelState } from './stateManager';
import { BotClient } from '../core/BotClient'; // Added import

/**
 * Declara el tipo de client en globalThis para evitar error TS7017.
 */
declare global {
  // Ajusta el tipo si tienes una clase personalizada de cliente
  var client: BotClient | undefined; // Changed type to BotClient
}

/**
 * Cambia el estado del bot (actividad) en Discord.
 * @param text Texto a mostrar como estado.
 * @param type Tipo de actividad (0=Playing, 2=Listening, 3=Watching, etc.)
 */
export function setBotActivity(songText: string, type: number = 2) {
  // songText puede ser: "▶️ - Lloraras by Dimension Latina, Oscar de Leon"
  const client = globalThis.client;
  console.log(
    '[MusicToEasy][DEBUG] Intentando setear actividad:',
    songText,
    'type:',
    type
  );
  if (client && client.user) {
    client.user.setActivity(songText, { type });
    client.currentActivityType = type;
    console.log(
      '[MusicToEasy][DEBUG] Actividad seteada correctamente. currentActivityType:',
      client.currentActivityType
    );
  } else {
    console.warn(
      '[MusicToEasy][DEBUG] No se pudo setear actividad: client o client.user no disponible.'
    );
  }
}

export async function deletePanel(
  channel: TextChannel,
  lastHelpMessageId?: string
) {
  if (lastHelpMessageId) {
    try {
      const lastPanel = await channel.messages.fetch(lastHelpMessageId);
      await lastPanel.delete();
      console.log('[MusicToEasy] Panel anterior eliminado.');
    } catch {
      console.warn(
        '[MusicToEasy] No se pudo eliminar el panel anterior (puede que ya no exista).'
      );
    }
  }
}

export async function sendPanel(
  channel: TextChannel,
  guildId: string,
  lyricsEnabled?: boolean
) {
  const client = globalThis.client;
  let finalLyricsEnabled = lyricsEnabled;

  if (finalLyricsEnabled === undefined) {
    // Si no se especifica, decidir en base a la actividad del bot.
    // Tipo 2 es "Listening to", lo que implica que hay una canción.
    finalLyricsEnabled = client?.currentActivityType === 2;
    console.log(
      `[MusicToEasy][DEBUG] lyricsEnabled no especificado, decidido por actividad: ${finalLyricsEnabled} (tipo: ${client?.currentActivityType})`
    );
  }

  const { embed, components } = createHelpMessage(
    guildId,
    channel.id,
    finalLyricsEnabled
  );
  const newPanel = await channel.send({ embeds: [embed], components });
  console.log('[MusicToEasy] Panel de comandos enviado con ID:', newPanel.id);
  writePanelState({
    guildId,
    channelId: channel.id,
    lastHelpMessageId: newPanel.id,
  });
  return newPanel;
}

export async function sendNowPlayingEmbed(
  channel: TextChannel,
  after: string,
  client: Client
) {
  const guild = channel.guild;
  const jockieIds = (process.env.JOCKIE_MUSIC_IDS || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Log de depuración solo para los IDs configurados (puedes quitarlo si no lo necesitas)
  console.log('[MusicToEasy][DEBUG] JOCKIE_MUSIC_IDS:', jockieIds);

  let jockieName = '';
  const jockieMember = guild.members.cache.find((m) =>
    jockieIds.includes(m.user.id)
  );
  if (jockieMember) {
    jockieName = `${jockieMember.displayName} está reproduciendo música`;
  } else {
    jockieName = 'Jockie Music está reproduciendo música';
  }

  // Extrae nombre y artista para el estado del bot (limpio)
  let song = after;
  let artist = '';
  // Intenta extraer del formato "[**Song** **by** **Artist**](link)"
  const match = after.match(/\[\*\*(.*?)\*\* by \*\*(.*?)\*\*\]/i);
  if (match) {
    song = match[1].trim();
    artist = match[2].trim();
  } else {
    // Alternativa: busca "Song by Artist" y limpia markdown y links
    let clean = after
      .replace(/\[|\]|\*\*|\(|\)|https?:\/\/\S+/g, '') // quita corchetes, asteriscos, paréntesis, links
      .replace(/\s{2,}/g, ' ') // espacios dobles
      .trim();
    const songArtistMatch = clean.match(/^(.*?)\s+by\s+(.*)$/i);
    if (songArtistMatch) {
      song = songArtistMatch[1].trim();
      artist = songArtistMatch[2].trim();
    } else {
      song = clean;
      artist = '';
    }
  }

  // Cambia el estado del bot a "▶️ - <canción> by <artista>"
  setBotActivity(`▶️ - ${song}${artist ? ` by ${artist}` : ''}`);

  const playingEmbed = new EmbedBuilder()
    .setColor(0x1db954)
    .setTitle('🎶 ¡Ahora suena!')
    .setDescription(after)
    .setFooter({ text: jockieName });
  await channel.send({ embeds: [playingEmbed] });
  console.log(
    '[MusicToEasy] Embed "¡Ahora suena!" enviado en canal del panel.'
  );
}

export async function deleteNowPlayingEmbed(
  channel: TextChannel,
  clientUserId: string
) {
  try {
    // Busca hasta 100 mensajes para asegurar que no quede ninguno viejo
    const messages = await channel.messages.fetch({ limit: 100 });
    const nowPlayingMessages = messages.filter(
      (m) =>
        m.author.id === clientUserId &&
        m.embeds[0]?.title === '🎶 ¡Ahora suena!'
    );
    for (const msg of nowPlayingMessages.values()) {
      await msg.delete();
      console.log('[MusicToEasy] Mensaje "¡Ahora suena!" eliminado.');
    }
  } catch (err) {
    console.warn(
      '[MusicToEasy] No se pudo eliminar el mensaje "¡Ahora suena!" (puede que ya no exista).'
    );
  }
}

/**
 * Actualiza el panel del canal para deshabilitar el botón "Letra".
 * @param channel Canal de texto donde está el panel.
 */
export async function disableLyricsButtonInPanel(channel: TextChannel) {
  // Busca el panel actual y lo reemplaza por uno con el botón deshabilitado
  const state = readPanelState(channel.guildId);
  if (!state?.lastHelpMessageId) return;
  try {
    const panelMsg = await channel.messages.fetch(state.lastHelpMessageId);
    const { embed, components } = createHelpMessage(
      channel.guildId,
      channel.id,
      false
    );
    await panelMsg.edit({ embeds: [embed], components });
  } catch {
    // Si el mensaje no existe, ignora
  }
}
