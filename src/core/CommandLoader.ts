import fs from 'fs';
import path from 'path';
import { BotClient } from './BotClient';

export class CommandLoader {
  constructor(private client: BotClient) {}

  public loadCommands(): void {
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) {
      console.warn('[CommandLoader] Directorio de comandos no existe:', commandsPath);
      return;
    }

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      
      try {
        const command = require(filePath);
        
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
