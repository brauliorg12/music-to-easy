import fs from 'fs';
import path from 'path';
import { BotClient } from './BotClient';

export class CommandLoader {
  constructor(private client: BotClient) {}

  /**
   * Carga automáticamente todos los comandos desde el directorio /commands.
   * Cada archivo debe exportar un objeto con las propiedades 'data' (información del comando)
   * y 'execute' (función que ejecuta el comando).
   * Registra cada comando en el cliente usando su nombre.
   * Si falta alguna propiedad o hay un error al cargar, lo muestra en consola.
   */
  public loadCommands(): void {
    const commandsPath = path.join(__dirname, '../commands');

    if (!fs.existsSync(commandsPath)) {
      console.warn(
        '[CommandLoader] Directorio de comandos no existe:',
        commandsPath
      );
      return;
    }

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);

      try {
        // Importa el comando
        const command = require(filePath);

        // Verifica que tenga las propiedades necesarias
        if (command.data && command.execute) {
          this.client.commands.set(command.data.name, command);
          console.log(`[Carga] Comando '${command.data.name}' cargado.`);
        } else {
          console.warn(
            `[Advertencia] El comando en ${filePath} le falta la propiedad 'data' o 'execute'.`
          );
        }
      } catch (error) {
        console.error(`[Error] No se pudo cargar el comando ${file}:`, error);
      }
    }
  }
}
