import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';

export interface ButtonInteractionHandler {
  execute(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalSubmitHandler {
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}
