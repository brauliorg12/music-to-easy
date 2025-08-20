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
| 📜 **Lista de Reproducción**  | `m!queue`          | Muestra la cola de reproducción |
| 🔊 **Volumen** | `m!volume <1-100>` | Ajusta el volumen               |

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

### Comandos Slash Disponibles

| Comando     | Descripción                                    | Permisos         |
| ----------- | ---------------------------------------------- | ---------------- |
| `/setup`    | Activa el sistema en el canal actual         | Administrador    |
| `/disable`  | Desactiva el sistema completamente           | Administrador    |

### Activar Sistema

```bash
# En Discord
/setup

# ¡Ya está listo! Usa los botones del panel
```

### Desactivar Sistema

```bash
# En Discord
/disable

# El panel se eliminará y el bot dejará de monitorear
```

### ✅ Características de los Mensajes

- **Botón Cerrar**: Todos los mensajes ephemeral incluyen botón ❌ para cerrar
- **Auto-eliminación**: El panel se reposiciona automáticamente
- **Feedback claro**: Confirmaciones con nombres de canales y servidores

## 🏗️ Para Desarrolladores

### Arquitectura Clean

```
src/
├── commands/          # Slash commands (/setup, /disable)
├── core/             # Core classes (BotClient, EventHandler)
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

4. **Deploy:** Agregar a `deploy-commands.ts` si es slash command

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
# Desarrollo
npm run dev        # Desarrollo con hot-reload
npm run build      # Compilar TypeScript
npm run start      # Producción (build + start)

# Comandos Discord
npm run deploy     # Desplegar comandos slash globalmente
npm run clear-commands  # Limpiar comandos globales

# Testing rápido (comandos de servidor)
ts-node src/deploy-guild-commands.ts  # Deploy inmediato en servidor específico
```

### 🚀 Deploy de Comandos

#### Opción 1: Deploy Global (Recomendado para producción)
```bash
npm run deploy
# Comandos disponibles en todos los servidores (hasta 1 hora de espera)
```

#### Opción 2: Deploy de Servidor (Desarrollo)
```bash
# Asegurar GUILD_ID en .env
ts-node src/deploy-guild-commands.ts
# Comandos disponibles inmediatamente solo en tu servidor
```

#### Opción 3: Limpiar y Redesplegar
```bash
npm run clear-commands  # Esperar 2-3 minutos
npm run deploy          # Redesplegar comandos
```

## ❓ Solución de Problemas

### 🚫 "Comandos no aparecen"

**Comandos Globales:**
- ✅ Ejecutar `npm run deploy` después de cambios
- ✅ Esperar hasta 1 hora para propagación
- ✅ Reiniciar Discord completamente

**Comandos de Servidor (Testing):**
- ✅ Verificar `GUILD_ID` en `.env`
- ✅ Ejecutar `ts-node src/deploy-guild-commands.ts`
- ✅ Aparecen inmediatamente

**Limpieza forzada:**
```bash
npm run clear-commands
# Esperar 2-3 minutos
npm run deploy
```

### 🚫 "Bot no responde"

- ✅ Verificar `DISCORD_TOKEN` en `.env`
- ✅ Bot tiene permisos necesarios
- ✅ `MESSAGE_CONTENT_INTENT` activado
- ✅ Ejecutado `/setup` en canal correcto

### 🚫 "Panel no se reposiciona"

- ✅ Bot tiene permisos de `Manage Messages`
- ✅ Sistema activado con `/setup`
- ✅ Verificar logs para errores

### 🚫 "Comando /disable no funciona"

- ✅ Sistema debe estar activo primero (`/setup`)
- ✅ Usar en canal con permisos de administrador
- ✅ Verificar que los comandos se desplegaron correctamente

## 📊 Logs y Monitoreo

### Logs del Sistema

```
[Music to Easy] Bot iniciado como BotName#1234!
[Info] Monitoreando 2 servidores:
  • Mi Servidor (ID: 123...) - 50 miembros
  • Servidor Test (ID: 456...) - 12 miembros

[Setup] Sistema activado en canal #música (789...) por usuario#1234
[Monitor] Mensaje de ayuda reenvíado tras mensaje de MEE6#4876 en #música
[Disable] Sistema desactivado del canal #música (789...) por usuario#1234
```

### Estados del Bot

- **Inactivo**: Sin canal configurado, no responde automáticamente
- **Activo**: Monitoreando canal específico, reposicionando panel
- **Transición**: Durante setup/disable, manejando cambios de estado

## 🤝 Contribuir

```bash
# Proceso estándar GitHub
git checkout -b feature/amazing-feature
git commit -m "Add: amazing feature"
git push origin feature/amazing-feature
# → Abrir Pull Request
```

### Estructura de Commits

```
Add: nueva funcionalidad
Fix: corrección de bug
Update: actualización de feature existente
Docs: actualización de documentación
Style: cambios de formato/estilo
Refactor: refactorización de código
Test: agregar/actualizar tests
```

## 📊 Estado del Proyecto

![Build Status](https://github.com/brauliorg12/music-to-easy/workflows/CI%2FCD%20Pipeline/badge.svg)
![Security](https://github.com/brauliorg12/music-to-easy/workflows/Security%20Scan/badge.svg)
![Docker](https://github.com/brauliorg12/music-to-easy/workflows/Docker/badge.svg)

## ⚠️ Limitaciones

- **Discord Webhook Limitation**: Los mensajes de bots siempre tienen etiqueta "APP"
- **Solución**: Comandos listos para copy-paste manual (más rápido que escribir)
- **Compatibilidad**: Funciona con cualquier bot de música con prefijos
- **Un Canal por Servidor**: Solo un canal activo por servidor simultáneamente

## 📝 Changelog Reciente

### v1.1.0
- ✅ Comando `/disable` para desactivar sistema
- ✅ Botones "Cerrar" en todos los mensajes ephemeral
- ✅ Logs mejorados con nombres de canales y servidores
- ✅ Arquitectura modular refactorizada
- ✅ Scripts de deploy para testing rápido

### v1.0.0
- 🎉 Lanzamiento inicial
- ✅ Panel de botones persistente
- ✅ Comando `/setup` para activar sistema
- ✅ Auto-reposicionamiento de mensajes

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
