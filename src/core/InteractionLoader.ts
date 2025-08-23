import fs from 'fs';
import path from 'path';
import { BotClient } from './BotClient';
import { CUSTOM_IDS } from '../utils/constants';

export class InteractionLoader {
  constructor(private client: BotClient) {}

  public loadInteractions(): void {
    const interactionsPath = path.join(__dirname, '../interactions');

    if (!fs.existsSync(interactionsPath)) {
      console.warn(
        '[InteractionLoader] Directorio de interacciones no existe:',
        interactionsPath
      );
      return;
    }

    const interactionFiles = fs
      .readdirSync(interactionsPath)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of interactionFiles) {
      const filePath = path.join(interactionsPath, file);

      try {
        const interactionHandler = require(filePath);

        const expectedCustomId = file.replace('.ts', '').replace('.js', '');
        const customIdKey = Object.keys(CUSTOM_IDS).find(
          (key) =>
            CUSTOM_IDS[key as keyof typeof CUSTOM_IDS] === expectedCustomId
        );

        if (customIdKey) {
          const customId = CUSTOM_IDS[customIdKey as keyof typeof CUSTOM_IDS];
          this.client.buttonInteractions.set(customId, interactionHandler);
          console.log(`[Carga] Manejador '${customId}' cargado.`);
        } else {
          console.warn(
            `[Advertencia] No se encontró un CUSTOM_ID para el archivo ${file} (esperaba: ${expectedCustomId})`
          );
        }
      } catch (error) {
        console.error(
          `[Error] No se pudo cargar la interacción ${file}:`,
          error
        );
      }
    }
  }
}
