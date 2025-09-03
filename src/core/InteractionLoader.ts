import fs from 'fs';
import path from 'path';
import { BotClient } from './BotClient';
import { CUSTOM_IDS } from '../utils/constants';
import { ButtonInteractionHandler } from '../types/Interaction';

export class InteractionLoader {
  constructor(private client: BotClient) {}

  /**
   * Carga automáticamente todos los manejadores de interacciones (botones) desde el directorio /interactions.
   * Asocia cada archivo con su CUSTOM_ID correspondiente y lo registra en el cliente.
   * Si el archivo no tiene un CUSTOM_ID asociado, muestra una advertencia.
   * Si ocurre un error al cargar un archivo, lo muestra en consola.
   */
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
        // Importa el manejador de interacción
        const interactionHandler =
          require(filePath) as ButtonInteractionHandler;

        // Determina el CUSTOM_ID esperado a partir del nombre del archivo
        const expectedCustomId = file.replace('.ts', '').replace('.js', '');
        const customIdKey = Object.keys(CUSTOM_IDS).find(
          (key) =>
            CUSTOM_IDS[key as keyof typeof CUSTOM_IDS] === expectedCustomId
        );

        if (customIdKey) {
          const customId = CUSTOM_IDS[customIdKey as keyof typeof CUSTOM_IDS];
          // Registra el manejador en el cliente
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
