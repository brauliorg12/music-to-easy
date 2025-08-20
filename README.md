# 🎵 Discord Music Helper Bot

Un bot de Discord elegante y moderno que simplifica el uso de bots de música mediante una interfaz intuitiva con botones y comandos fáciles de copiar.

## ✨ Características

- **🎛️ Panel de Control Persistente**: Mantiene un mensaje de ayuda siempre visible al final del canal
- **🔄 Auto-reposicionamiento**: Se recoloca automáticamente cuando otros bots escriben mensajes
- **📱 Interfaz Moderna**: Botones intuitivos para cada comando de música
- **📋 Copia Fácil**: Un clic para copiar comandos, sin necesidad de recordar prefijos
- **🎯 Mensajes Efímeros**: Respuestas privadas que solo ve el usuario
- **🏗️ Código Profesional**: Arquitectura limpia, tipado fuerte y patrones de diseño

## 🚀 Funcionalidades

### Comandos Soportados
- **▶️ Play**: `m!p <canción>` - Reproduce música
- **⏹️ Stop**: `m!leave` - Detiene y desconecta el bot
- **⏭️ Skip**: `m!next` - Salta a la siguiente canción  
- **📜 Queue**: `m!queue` - Muestra la cola de reproducción
- **🔊 Volume**: `m!volume <1-100>` - Ajusta el volumen

### Flujo de Usuario
1. Administrador ejecuta `/setup` en un canal
2. Aparece un panel con botones de comandos
3. Usuario hace clic en un botón (ej: Play)
4. Aparece mensaje efímero con el comando listo para copiar
5. Usuario copia el comando y lo pega en el chat
6. El bot de música responde normalmente

## 🛠️ Instalación

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- Un bot de música existente en tu servidor (Mee6, Groovy, etc.)

### 1. Configuración en Discord

1. Ve al [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la sección "Bot" y crea un bot
4. **Importante**: Activa "MESSAGE CONTENT INTENT" en Privileged Gateway Intents
5. Copia el token del bot

### 2. Instalación del Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tusuario/discord-music-buttons.git
cd discord-music-buttons

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 3. Configuración de Variables

Edita el archivo `.env`:

```env
# Token del bot de Discord
DISCORD_TOKEN=tu_token_aqui

# ID de la aplicación (Client ID)
CLIENT_ID=tu_client_id_aqui

# ID del servidor para pruebas (opcional)
GUILD_ID=tu_guild_id_aqui
```

**¿Cómo obtener estos valores?**
- **CLIENT_ID**: En el portal de desarrolladores, pestaña "OAuth2" → "General"
- **GUILD_ID**: Clic derecho en tu servidor → "Copiar ID del servidor" (requiere modo desarrollador)

### 4. Invitar el Bot

1. Ve a "OAuth2" → "URL Generator" en el portal de desarrolladores
2. Selecciona los scopes: `bot` y `applications.commands`
3. Permisos mínimos requeridos:
   - `View Channels`
   - `Send Messages`
   - `Read Message History`
   - `Manage Messages` (para eliminar mensajes efímeros)

## 🚀 Uso

```bash
# Desplegar comandos slash (solo una vez)
npm run deploy

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm run start
```

### En Discord
1. Ejecuta `/setup` en el canal donde quieres la ayuda de música
2. ¡El panel estará listo para usar!

## 🏗️ Arquitectura del Proyecto

```
src/
├── commands/           # Comandos slash
│   └── setup.ts       # Comando de configuración
├── handlers/          # Manejadores base
│   └── MusicCommandHandler.ts
├── interactions/      # Manejadores de botones
│   ├── play.ts
│   ├── stop.ts
│   ├── skip.ts
│   ├── queue.ts
│   ├── volume.ts
│   └── close.ts
├── utils/            # Utilidades
│   ├── constants.ts  # IDs y comandos
│   ├── helpMessage.ts # Generador de mensajes
│   ├── buttonHelpers.ts # Helpers para botones
│   └── botState.ts   # Estado del bot
└── index.ts          # Punto de entrada
```

### Patrones de Diseño Utilizados
- **Singleton**: Para el estado del bot
- **Template Method**: Handler base para comandos de música
- **Factory**: Para creación de botones y mensajes
- **Command Pattern**: Para manejo de interacciones

## 🔧 Personalización

### Agregar Nuevos Comandos

1. Agrega el comando en `src/utils/constants.ts`:
```typescript
export const CUSTOM_IDS = {
    // ... existentes
    PAUSE: 'pause',
};

export const MUSIC_COMMANDS = {
    // ... existentes  
    PAUSE: 'm!pause',
};
```

2. Crea el manejador en `src/interactions/pause.ts`:
```typescript
import { ButtonInteraction } from 'discord.js';
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';
import { MUSIC_COMMANDS } from '../utils/constants';

class PauseHandler extends MusicCommandHandler {
    protected getCommand(): string {
        return MUSIC_COMMANDS.PAUSE;
    }

    protected getInstruction(): string {
        return '💡 Pégalo en el chat para pausar';
    }
}

const pauseHandler = new PauseHandler();

export async function execute(interaction: ButtonInteraction) {
    await pauseHandler.execute(interaction);
}
```

3. Añade el botón en `src/utils/helpMessage.ts`

### Cambiar Bot de Música

Simplemente modifica los comandos en `MUSIC_COMMANDS`:

```typescript
// Para cambiar de Mee6 a otro bot
export const MUSIC_COMMANDS = {
    PLAY: '!play ',     // En lugar de 'm!p '
    STOP: '!disconnect', // En lugar de 'm!leave'
    // ... etc
};
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo con recarga automática
npm run start    # Producción (compila y ejecuta)
npm run deploy   # Despliega comandos slash a Discord
npm run build    # Compila TypeScript a JavaScript
```

## ⚠️ Limitaciones Conocidas

- **Mensajes de Bot**: Discord siempre marca los mensajes de webhooks como "APP", la mayoría de bots de música los ignoran
- **Solución Implementada**: El bot proporciona comandos listos para copiar y pegar manualmente
- **Compatibilidad**: Funciona con cualquier bot de música basado en prefijos de texto

## 🐛 Solución de Problemas

### El bot no responde
- Verifica que el token sea correcto
- Asegúrate de que el bot tenga los permisos necesarios
- Revisa que MESSAGE_CONTENT_INTENT esté activado

### Los comandos no se cargan
- Ejecuta `npm run deploy` después de cambios
- Verifica CLIENT_ID en el archivo .env
- Revisa los logs por errores de sintaxis

### El mensaje de ayuda no se reposiciona
- Verifica que el bot tenga permisos para enviar/eliminar mensajes
- Asegúrate de que esté monitoreando el canal correcto

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Tu Nombre**
- GitHub: [@tusuario](https://github.com/tusuario)
- Discord: tu_discord#1234

## 🙏 Agradecimientos

- [Discord.js](https://discord.js.org/) por la excelente librería
- Comunidad de Discord por el feedback
- Desarrolladores de bots de música que inspiraron este proyecto

---

⭐ ¡Dale una estrella si este proyecto te fue útil!