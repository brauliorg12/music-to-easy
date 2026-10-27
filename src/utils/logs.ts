import { Client, Guild } from 'discord.js';

/**
 * Imprime el logo del bot en la consola de arranque.
 */
export function printLogo() {
  console.log(`
\x1b[36m  
        🎵  Music to Easy - Discord Bot 🎵
        by Burlon23
\x1b[0m
    `);
}

/**
 * Imprime en consola la información de inicio: usuario, fecha y hora local y UTC.
 * @param client Instancia del cliente de Discord.
 */
export function printStartupInfo(client: Client) {
  const userTag = client.user?.tag;
  const now = new Date();
  const fechaLocal = now.toLocaleString();
  const fechaUTC = now.toISOString();

  console.log('\x1b[32m%s\x1b[0m', '🟢 Conectado');
  console.log(`[App] Nombre: Music to Easy`);
  console.log(`[App] Usuario Discord: ${userTag}`);
  console.log(`[App] Inicio: ${fechaLocal} (local) | ${fechaUTC} (UTC)`);
}

/**
 * Imprime en consola los servidores donde está conectado el bot.
 * @param client Instancia del cliente de Discord.
 */
export function logServerInfo(client: Client) {
  const guilds = client.guilds.cache;
  const guildCount = guilds.size;
  if (guildCount === 0) {
    console.log('[Info] No está conectado a ningún servidor');
    return;
  }
  const serverWord = guildCount === 1 ? 'servidor' : 'servidores';
  console.log(`[Info] Monitoreando ${guildCount} ${serverWord}:`);
  guilds.forEach((guild: Guild) => {
    console.log(
      `  • ${guild.name} (ID: ${guild.id}) - ${guild.memberCount} miembros`
    );
  });
}
