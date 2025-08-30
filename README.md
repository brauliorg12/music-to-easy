# 🎵 Music to Easy

Bot de Discord que facilita el uso de comandos de música de otros bots mediante un **panel persistente** y comandos slash de configuración. Music to Easy no reproduce música directamente, sino que te ayuda a usar otros bots de música de forma más sencilla.

![Version](https://img.shields.io/github/v/release/brauliorg12/music-to-easy)
![License](https://img.shields.io/github/license/brauliorg12/music-to-easy)
![Docker](https://img.shields.io/docker/automated/brauliorg12/music-to-easy)

---

## 🚀 ¿Qué es Music to Easy?

Music to Easy crea un **panel de control** con comandos en el canal que elijas. Al pulsar un botón, el bot te muestra el comando listo para copiar y pegar en el chat, facilitando el uso de bots de música populares (Mee6, Jockie, FredBoat, etc).

---

## 🟢 Comandos Slash Disponibles

| Comando    | Descripción                                                   | Permisos      |
| ---------- | ------------------------------------------------------------- | ------------- |
| `/music`   | Activa el panel de control de música en el canal actual       | Administrador |
| `/disable` | Desactiva el sistema y elimina el panel del canal configurado | Administrador |

> **Nota:** Estos son los únicos comandos propios de este bot.

---

## 🎛️ Panel de Comandos

El panel muestra los comandos más comunes (Play, Stop, Next, Listado) listos para copiar y pegar.  
Solo tienes que hacer click en el bloque de código del comando y pegarlo en el chat del bot de música que uses.

---

## ✨ Características principales

- Panel persistente: Siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan.
- Comandos listos para copiar: Obtén los comandos de música más usados con un click.
- Ayuda integrada: Explicaciones claras sobre cómo usar el panel.
- Fácil configuración: Solo dos comandos para activar o desactivar el sistema.

---

## 🛠️ Instalación

### Opción 1: Docker (Recomendado) 🐳

1. Clona el repositorio y configura el archivo `.env`.
2. Ejecuta `docker-compose up`.

### Opción 2: Instalación Manual

1. Clona el repositorio.
2. Instala dependencias con `npm install`.
3. Copia `.env.example` a `.env` y edítalo.
4. **Invita el bot a tu servidor usando este enlace personalizado:**  
   [Invitar Music to Easy a tu servidor](https://discord.com/oauth2/authorize?client_id=1030804069599678524&scope=bot%20applications.commands&permissions=274878221440)
5. Despliega los comandos con `npm run deploy`.
6. Ejecuta el bot con `npm run dev`.

> **Nota:**  
> La instalación NO es automática. Debes invitar el bot manualmente usando el enlace anterior, ya que Discord requiere autorización explícita para cada servidor.

---

## ⚙️ Configuración Discord

1. Crea una aplicación y un bot en [Discord Developer Portal](https://discord.com/developers/applications).
2. Activa "MESSAGE CONTENT INTENT".
3. Copia el token y colócalo en `.env` junto con `CLIENT_ID` y opcionalmente `GUILD_ID`.
4. Invita el bot a tu servidor con los permisos necesarios:
   - Ver canales
   - Enviar mensajes
   - Leer historial de mensajes
   - Gestionar mensajes

---

## 🎮 Uso rápido

1. Un administrador ejecuta `/music` en el canal deseado.
2. El panel de comandos aparece y se mantiene siempre visible.
3. Los usuarios copian el comando y lo pegan en el chat del bot de música.
4. El botón de ayuda muestra instrucciones claras sobre cómo usar el panel.

---

## 🏗️ Estructura del Proyecto

- `src/commands/`: Comandos slash (`/music`, `/disable`)
- `src/core/`: Clases principales (BotClient, EventHandler)
- `src/handlers/`: Handlers base
- `src/interactions/`: Handlers de botones
- `src/utils/`: Utilidades y helpers
- `src/index.ts`: Punto de entrada principal

---

## 🎨 Personalización

Puedes cambiar los comandos generados por los botones editando el archivo de constantes en `src/utils/constants.ts`.

---

## 🐳 Docker & CI/CD

- Imágenes pre-construidas disponibles en GitHub Container Registry.
- Build multi-arquitectura.
- Pipeline automática con tests, build y publicación.

---

## ⚡ Scripts NPM

- `npm run dev`: Desarrollo con hot-reload
- `npm run build`: Compilar TypeScript
- `npm run start`: Producción
- `npm run deploy`: Desplegar comandos slash globalmente
- `npm run clear-commands`: Limpiar comandos globales

---

## ❓ Solución de Problemas

- Si los comandos no aparecen, ejecuta `npm run deploy` y espera hasta 1 hora (global).
- Si el bot no responde, revisa el token y permisos.
- Si el panel no se reposiciona, asegúrate de que el bot tenga permisos de "Gestionar mensajes".
- El comando `/disable` solo funciona si el sistema está activo.

---

## 📊 Logs y Monitoreo

El bot muestra logs claros en consola sobre su estado, canales configurados y acciones realizadas.

---

## 🤝 Contribuir

1. Haz un fork y crea una rama para tu feature.
2. Haz tus cambios y abre un Pull Request.
3. Sigue la convención de commits: `Add:`, `Fix:`, `Update:`, etc.

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles.

---

## 👤 Autor

**Braulio Rodriguez**

- GitHub: [@brauliorg12](https://github.com/brauliorg12)
- Discord: burlon23
- Email: cubanovainfo@gmail.com

---

¿Te gusta Music to Easy?  
⭐ ¡Dale una estrella! ⭐

[Reportar Bug](https://github.com/brauliorg12/music-to-easy/issues) • [Solicitar Feature](https://github.com/brauliorg12/music-to-easy/issues) • [Discusiones](https://github.com/brauliorg12/music-to-easy/discussions)
