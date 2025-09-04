# 🎵 Music to Easy

Bot de Discord que facilita el uso de comandos de música de otros bots mediante un **panel persistente** y comandos slash de configuración. Music to Easy no reproduce música directamente, sino que te ayuda a usar otros bots de música de forma más sencilla.

![Version](https://img.shields.io/github/v/release/brauliorg12/music-to-easy)
![License](https://img.shields.io/github/license/brauliorg12/music-to-easy)
![Docker](https://img.shields.io/docker/automated/brauliorg12/music-to-easy)

---

## 🚀 ¿Qué es Music to Easy?

Music to Easy crea un **panel de control** con comandos en el canal que elijas.  
Al pulsar un botón, el bot te muestra el comando listo para copiar y pegar en el chat del bot de música (principalmente Jockie Music).

- El panel **NO ejecuta comandos automáticamente**, solo los muestra para que los copies y pegues tú mismo.
- El panel se mantiene siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan.

---

## 🤖 Compatibilidad de Bots

| Bot          | Estado           |
| ------------ | ---------------- |
| Jockie Music | ✅ Soportado     |
| Mee6         | 🚧 En desarrollo |
| FredBoat     | 🚧 En desarrollo |

> Actualmente Music to Easy está optimizado para Jockie Music. El soporte para otros bots está en desarrollo.

---

## 🟢 Comandos Slash Disponibles

| Comando              | Descripción                                                                            | Permisos      |
| -------------------- | -------------------------------------------------------------------------------------- | ------------- |
| `/music`             | Activa el panel de control de música en el canal actual                                | Administrador |
| `/disable`           | Desactiva el sistema y elimina el panel del canal configurado                          | Administrador |
| `/autodetect`        | Activa la sugerencia automática de comandos por links o nombres **en el canal actual** | Administrador |
| `/disableautodetect` | Desactiva la sugerencia automática de comandos **en el canal actual**                  | Administrador |

> **Nota:** Todos los comandos afectan solo al canal donde se ejecutan, excepto `/disable` que elimina el panel del canal configurado.

---

## 🎛️ Panel de Comandos

El panel muestra los comandos más comunes (Play, Pause, Stop, Next, Listado) listos para copiar y pegar.  
Solo tienes que hacer click en el bloque de código del comando y pegarlo en el chat del bot de música que uses.

## ✨ Sugerencia automática de comandos

- Si envías un link de YouTube/Spotify o escribes el nombre de una canción en el chat, el bot te sugiere automáticamente el comando `m!p` listo para copiar y pegar.
- Solo tú verás la sugerencia y podrás cerrarla con el botón "Cerrar".
- Las sugerencias se autodestruyen automáticamente a los 60 segundos si no las cierras.
- Si un administrador ejecuta `/disableautodetect`, todas las sugerencias activas del canal se eliminan inmediatamente.

---

## ✨ Características principales

- Panel persistente: Siempre visible y se reposiciona automáticamente si otros mensajes lo desplazan.
- Comandos listos para copiar: Obtén los comandos de música más usados con un click.
- Ayuda integrada: Explicaciones claras sobre cómo usar el panel.
- Fácil configuración: Solo dos comandos para activar o desactivar el sistema.
- **Sugerencia automática de comandos por canal (opcional):**  
  Puedes activar o desactivar la sugerencia automática de comandos con `/autodetect` y `/disableautodetect` en cualquier canal.
  - **Solo funciona en canales donde el panel `/music` está activo.**
  - Si desactivas la sugerencia en un canal, el bot no sugerirá comandos automáticamente en ese canal hasta que la vuelvas a activar.
  - Si desactivas el panel con `/disable`, la sugerencia automática también dejará de funcionar en ese canal.
- **Embed "Ahora suena":**  
  Cuando un bot de música (como Jockie Music) inicia la reproducción de una canción, Music to Easy muestra automáticamente un mensaje especial "¡Ahora suena!" con el nombre de la canción y artista. Este mensaje se elimina y actualiza automáticamente cuando cambia la canción o se detiene la reproducción.
- **Estado dinámico del bot (Activity):**  
  El estado del bot se actualiza en tiempo real:
  - Cuando se reproduce una canción, el bot muestra "▶️ - <canción> by <artista>" como estado (tipo Listening).
  - Cuando no hay música, vuelve al estado por defecto (tipo Watching).
  - Esto permite a los usuarios saber si hay música sonando y cuál, directamente desde la lista de miembros de Discord.
- Limpieza automática de mensajes "Ahora suena" y paneles para evitar duplicados o mensajes obsoletos.
- Integración inteligente con bots de música populares: detecta eventos relevantes y actualiza el panel y los mensajes en consecuencia.

## 🎤 Panel "Letra" (solo Jockie Music)

- Si hay una canción sonando (detectada por Jockie Music), el panel habilita el botón 🎤 **Letra**.
- Al pulsar el botón, el bot busca la letra y la publica en el canal.
- Puedes cerrar todos los mensajes de la letra usando el botón "❌ Cerrar".
- El panel de letras se elimina automáticamente al cambiar la canción, detenerse o al pulsar "Cerrar".

- **Sincronización de letras:**  
  El sistema de letras está integrado con el panel principal y el estado del bot, mostrando la letra correcta en tiempo real y limpiando mensajes obsoletos para evitar duplicados.

- **Limpieza automática:**  
  Los mensajes de letras se eliminan automáticamente cuando la canción termina, cambia o el usuario pulsa el botón "❌ Cerrar", manteniendo el canal limpio y sincronizado.

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
5. **Sugerencia automática (opcional y por canal):**
   - Activa la sugerencia automática en el canal con `/autodetect`.
   - Desactívala en el canal con `/disableautodetect`.
   - Solo funcionará en canales donde el panel `/music` esté activo.

---

## 🏗️ Estructura del Proyecto

- `src/commands/`: Comandos slash (`/music`, `/disable`, `/autodetect`, `/disableautodetect`)
- `src/constants/`: Constantes generales y de bot
- `src/core/`: Clases principales (BotClient, EventHandler, CommandLoader)
- `src/errors/`: Manejo de errores
- `src/interactions/`: Handlers de botones y modales
- `src/lyrics/`: Lógica de letras de canciones
- `src/services/`: Servicios externos/internos
- `src/types/`: Tipos TypeScript
- `src/utils/`: Utilidades y helpers (incluye lógica de panel, sugerencias, estado, etc.)
- `src/index.ts`: Punto de entrada principal
- `db/`: Archivos de estado y configuración persistente por canal/servidor

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

## ℹ️ Notas sobre la sugerencia automática

- La sugerencia automática es **por canal** y **persistente**.
- Solo los administradores pueden activar o desactivar la función en cada canal.
- Si el panel de música se elimina de un canal, la sugerencia automática también dejará de funcionar en ese canal.
- Puedes tener la sugerencia activa en unos canales y desactivada en otros, según tus necesidades.
- **Al ejecutar `/disable`, también se elimina la configuración de autodetect para ese canal, dejando todo limpio y sincronizado.**

---

## 🧩 Arquitectura y Solución Técnica

### Flujo de eventos y actualización del panel

1. **Recepción de mensajes de bots de música:**  
   El bot escucha todos los mensajes en los canales configurados. Cuando detecta un mensaje relevante de un bot de música (por ejemplo, Jockie Music), analiza el contenido y los embeds para identificar eventos como "started playing" o fin de la cola.
2. **Actualización del embed "Ahora suena" y Sincronización de Letras:**
   - Al comenzar una nueva canción, se eliminan automáticamente el embed de "Ahora suena" y **todos los mensajes de la letra** de la canción anterior.
   - Se envía un nuevo embed de "Ahora suena" con la información de la nueva canción.
   - Si la reproducción termina, se limpian tanto el embed de "Ahora suena" como los mensajes de la letra, y el panel de botones se actualiza para deshabilitar el botón de "Letra".
   - Esta sincronización es atómica y asegura que el canal nunca muestre información inconsistente.
3. **Actualización del estado del bot (Activity):**
   - Al detectar una canción en reproducción, el bot cambia su estado a "▶️ - <canción> by <artista>" (Listening).
   - Cuando no hay música, vuelve al estado por defecto (Watching).
   - Esto se gestiona centralizadamente para evitar inconsistencias.
4. **Reposicionamiento y limpieza del panel:**
   - El panel de comandos se mantiene siempre visible. Si otros mensajes lo desplazan, el bot lo elimina y lo vuelve a enviar automáticamente.
   - Se evita la duplicación de paneles y mensajes especiales mediante lógica de control y limpieza inteligente.
5. **Sincronización multi-servidor:**
   - Toda la lógica es multi-servidor y multi-canal, con persistencia de estado por servidor/canal.
   - Al reiniciar el bot, se reponen los paneles y se limpian mensajes efímeros antiguos.

### Componentes clave

- **EventHandler:**  
  Orquesta todos los eventos de Discord y delega a los módulos especializados según el tipo de mensaje o interacción.
- **jockieMusicAnnouncer:**  
  Detecta eventos de bots de música y gestiona el embed "Ahora suena", el panel y el estado del bot.
- **musicBotEventHelpers:**  
  Filtra mensajes para evitar acciones duplicadas o innecesarias.
- **jockiePanelActions:**  
  Centraliza el envío y eliminación de paneles y mensajes especiales.
- **stateManager:**  
  Persiste el estado de los paneles y configuraciones por servidor/canal.

---

## 📝 Ejemplo de mensaje "Ahora suena"

Cuando se detecta una nueva canción, el bot envía un embed como este:

```
🎶 ¡Ahora suena!
Canción: Never Gonna Give You Up
Artista: Rick Astley
```

Este mensaje se elimina automáticamente cuando cambia la canción o termina la reproducción.

---

## 🟢 Estado del bot (Activity)

- **En reproducción:**  
  El bot muestra en su estado:  
  `▶️ - Never Gonna Give You Up by Rick Astley`  
  (Tipo: Escuchando/Listening)
- **Idle o ayuda:**  
  El bot muestra:  
  `🤖 Bot de ayuda de comandos de música`  
  (Tipo: Viendo/Watching)

Esto permite a los usuarios saber si hay música sonando y cuál, sin necesidad de mirar el canal.

---

## 🧹 Limpieza automática e inteligente de sugerencias

- Los mensajes de sugerencia de comando ("Sugerencia de comando") se eliminan automáticamente después de un tiempo (por defecto, 60 segundos) o cuando el usuario cierra el mensaje con el botón "Cerrar".
- Cuando el bot se reinicia o se reactiva el panel principal con `/music`, el bot limpia automáticamente solo las sugerencias **antiguas** (de más de 60 segundos) en el canal, dejando las sugerencias recientes para no interrumpir a los usuarios que están interactuando.
- Al ejecutar `/disableautodetect`, **todas las sugerencias activas del canal se eliminan inmediatamente**.
- Así, el canal se mantiene limpio y sin acumulación de mensajes efímeros, pero los usuarios nunca pierden una sugerencia reciente por culpa de un reinicio o reposicionamiento del panel.
- Este sistema es automático y no requiere intervención manual de los administradores.

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
