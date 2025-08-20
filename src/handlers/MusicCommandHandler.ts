import { ButtonInteraction } from 'discord.js';
import { ButtonHelpers } from '../utils/buttonHelpers';

export abstract class MusicCommandHandler {
  protected abstract getCommand(): string;
  protected abstract getInstruction(): string;

  async execute(interaction: ButtonInteraction): Promise<void> {
    const command = this.getCommand();
    const instruction = this.getInstruction();
    const closeButton = ButtonHelpers.createCloseButton();
    const content = ButtonHelpers.createCommandResponse(command, instruction);

    await interaction.reply({
      content,
      components: [closeButton],
      ephemeral: true,
    });
  }
}
