import { ButtonInteraction } from 'discord.js';

export async function execute(interaction: ButtonInteraction): Promise<void> {
  try {
    // Actualizar el mensaje para eliminarlo visualmente
    await interaction.update({
      content: 'Mensaje cerrado...',
      components: [],
      embeds: [],
    });

    // Eliminar el mensaje después de un breve delay
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        console.debug('[Close] No se pudo eliminar el mensaje:', errorMessage);
      }
    }, 100);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Close] Error al cerrar mensaje:', errorMessage);
  }
}
