# 🎵 Music to Easy

Un bot de Discord que hace que usar comandos de música sea **súper fácil** con botones intuitivos y comandos listos para copiar.

![Version](https://img.shields.io/github/v/release/brauliorg12/music-to-easy)
![License](https://img.shields.io/github/license/brauliorg12/music-to-easy)
![Docker](https://img.shields.io/docker/automated/brauliorg12/music-to-easy)

## ✨ ¿Por qué Music to Easy?

¿Cansado de recordar comandos como `m!p`, `m!skip`, `m!queue`? **Music to Easy** elimina esa fricción:

- 🚫 **No más**: Escribir `m!p https://youtube.com/...`
- ✅ **Ahora**: Click en ▶️ → Pegar link → ¡Listo!

## 🚀 Funcionalidades

### 🎛️ Panel de Control Inteligente

- **Persistente**: Siempre visible al final del canal
- **Auto-reposicionamiento**: Se mueve automáticamente cuando otros bots escriben
- **Botones intuitivos**: ▶️ Play, ⏹️ Stop, ⏭️ Skip, 📜 Queue, 🔊 Volume

### 📋 Comandos Soportados

| Botón         | Comando            | Descripción                     |
| ------------- | ------------------ | ------------------------------- |
| ▶️ **Play**   | `m!p <canción>`    | Reproduce música                |
| ⏹️ **Stop**   | `m!leave`          | Detiene y desconecta el bot     |
| ⏭️ **Skip**   | `m!next`           | Salta a la siguiente canción    |
| 📜 **Queue**  | `m!queue`          | Muestra la cola de reproducción |
| 🔊 **Volume** | `m!volume <1-100>` | Ajusta el volumen               |

### 🎯 Flujo Super Fácil

1. Administrador ejecuta `/setup` una sola vez
2. Panel aparece automáticamente
3. Usuario: Click en botón → Aparece comando → Copia → Pega → ¡Música!

## 🛠️ Instalación Rápida

### Opción 1: Docker (Recomendado) 🐳

```bash
# Clonar y configurar
git clone https://github.com/brauliorg12/music-to-easy.git
cd music-to-easy
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar con un comando
docker-compose up
```

### Opción 2: Instalación Manual

```bash
# Clonar el repositorio
git clone https://github.com/brauliorg12/music-to-easy.git
cd music-to-easy

# Instalar y configurar
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Desplegar comandos y ejecutar
npm run deploy
npm run dev
```

## ⚙️ Configuración Discord

### 1. Crear Bot en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. "New Application" → Nombre: "Music to Easy"
3. Sección "Bot" → "Add Bot"
4. **IMPORTANTE**: Activar "MESSAGE CONTENT INTENT"
5. Copiar token

### 2. Variables de Entorno

```env
DISCORD_TOKEN=tu_token_de_discord_aqui
CLIENT_ID=tu_client_id_aqui
GUILD_ID=tu_guild_id_aqui  # Opcional para testing
```

### 3. Invitar Bot

**Permisos necesarios:**

- `View Channels` - Ver canales
- `Send Messages` - Enviar mensajes
- `Read Message History` - Leer historial
- `Manage Messages` - Gestionar mensajes (para cerrar efímeros)

**URL Generator:** `bot` + `applications.commands` scopes

## 🎮 Uso

```bash
# En Discord
/setup

# ¡Ya está listo! Usa los botones del panel
```

## 🏗️ Para Desarrolladores

### Arquitectura Clean

```
src/
├── commands/          # Slash commands (/setup)
├── handlers/          # Base handlers (Template Pattern)
├── interactions/      # Button handlers (Command Pattern)
├── utils/            # Utilities & helpers (Factory Pattern)
└── index.ts          # Main entry point (Singleton Pattern)
```

### Agregar Nuevo Comando

1. **Constants:**

```typescript
// src/utils/constants.ts
export const CUSTOM_IDS = {
  // ...existentes
  PAUSE: 'pause',
};

export const MUSIC_COMMANDS = {
  // ...existentes
  PAUSE: 'm!pause',
};
```

2. **Handler:**

```typescript
// src/interactions/pause.ts
import { MusicCommandHandler } from '../handlers/MusicCommandHandler';

class PauseHandler extends MusicCommandHandler {
  protected getCommand() {
    return MUSIC_COMMANDS.PAUSE;
  }
  protected getInstruction() {
    return '💡 Pégalo en el chat para pausar';
  }
}

export async function execute(interaction: ButtonInteraction) {
  await new PauseHandler().execute(interaction);
}
```

3. **UI (helpMessage.ts):** Agregar botón al panel

### 🎨 Personalización

**Cambiar bot de música:**

```typescript
// Cambiar de Mee6 a otro bot
export const MUSIC_COMMANDS = {
  PLAY: '!play ', // En lugar de 'm!p '
  STOP: '!disconnect', // En lugar de 'm!leave'
  // ...
};
```

## 🐳 Docker & CI/CD

### Imágenes Pre-construidas

```bash
# Desde GitHub Container Registry
docker run --env-file .env ghcr.io/brauliorg12/music-to-easy:latest

# Multi-arquitectura: AMD64 + ARM64
```

### Pipeline Automática

- ✅ Tests en cada PR
- 🐳 Build multi-arch automático
- 🔒 Security scan con Trivy
- 📦 Publicación en GitHub Registry
- 🚀 Deploy en rama main

### Comandos Útiles

```bash
make help           # Ver comandos disponibles
make docker-dev     # Desarrollo con hot-reload
make docker-prod    # Producción
make logs          # Ver logs en tiempo real
```

## ⚡ Scripts NPM

```bash
npm run dev        # Desarrollo con hot-reload
npm run build      # Compilar TypeScript
npm run start      # Producción (build + start)
npm run deploy     # Desplegar comandos slash
```

## ❓ Solución de Problemas

### 🚫 "Bot no responde"

- ✅ Verificar `DISCORD_TOKEN` en `.env`
- ✅ Bot tiene permisos necesarios
- ✅ `MESSAGE_CONTENT_INTENT` activado

### 🚫 "Comandos no cargan"

- ✅ Ejecutar `npm run deploy` después de cambios
- ✅ Verificar `CLIENT_ID` correcto
- ✅ Revisar logs por errores

### 🚫 "Panel no se reposiciona"

- ✅ Bot tiene permisos de `Manage Messages`
- ✅ Ejecutado `/setup` en canal correcto

## 🤝 Contribuir

```bash
# Proceso estándar GitHub
git checkout -b feature/amazing-feature
git commit -m "Add: amazing feature"
git push origin feature/amazing-feature
# → Abrir Pull Request
```

## 📊 Estado del Proyecto

![Build Status](https://github.com/brauliorg12/music-to-easy/workflows/CI%2FCD%20Pipeline/badge.svg)
![Security](https://github.com/brauliorg12/music-to-easy/workflows/Security%20Scan/badge.svg)
![Docker](https://github.com/brauliorg12/music-to-easy/workflows/Docker/badge.svg)

## ⚠️ Limitaciones

- **Discord Webhook Limitation**: Los mensajes de bots siempre tienen etiqueta "APP"
- **Solución**: Comandos listos para copy-paste manual (más rápido que escribir)
- **Compatibilidad**: Funciona con cualquier bot de música con prefijos

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Braulio Rodriguez**

- 🐙 GitHub: [@brauliorg12](https://github.com/brauliorg12)
- 💬 Discord: burlon23
- 📧 Email: cubanovainfo@gmail.com

## 🙏 Agradecimientos

- [Discord.js](https://discord.js.org/) - Excelente librería
- Comunidad Discord - Feedback invaluable
- Desarrolladores de bots música - Inspiración

---

<div align="center">

**¿Te gusta Music to Easy?**

⭐ ¡Dale una estrella! ⭐

[🐛 Reportar Bug](https://github.com/brauliorg12/music-to-easy/issues) • [✨ Solicitar Feature](https://github.com/brauliorg12/music-to-easy/issues) • [💬 Discusiones](https://github.com/brauliorg12/music-to-easy/discussions)

</div>
