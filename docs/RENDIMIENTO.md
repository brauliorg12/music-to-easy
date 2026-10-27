# Rendimiento y arquitectura interna — Music to Easy

## 1. Propósito y modelo de ejecución

Music to Easy es un bot de Discord que facilita el uso de otros bots de música, principalmente Jockie Music. No reproduce audio ni se conecta a canales de voz. Publica un panel de comandos listos para copiar, mantiene el panel al final del canal, detecta links o nombres de canciones, anuncia la canción actual, publica letras y sincroniza la actividad del bot.

El modelo de ejecución está pensado para consumo mínimo de CPU y comportamiento predecible:

- Node.js 24.22.1.
- TypeScript en modo estricto, compilado a CommonJS.
- `discord.js` 14.x.
- Un solo proceso y un solo shard.
- Persistencia en archivos JSON dentro de `db/`, sin base de datos ni caché en memoria.
- Despliegue sobre pocos servidores.

En producción se ejecuta el bot compilado con `npm run start`, sin watcher de desarrollo ni recarga automática. El modo `npm run dev` queda reservado para desarrollo local.

## 2. Arquitectura de eventos y responsabilidades

El punto de entrada es `src/index.ts`. Allí se carga `dotenv`, se valida `DISCORD_TOKEN`, se crea `BotClient`, se registra el cliente global con `setGlobalClient` y se configuran el cierre limpio, la limpieza inicial de sugerencias y el listener de sugerencias de comando.

`src/core/EventHandler.ts` concentra el enrutamiento de eventos:

- `ready`: imprime el arranque y ejecuta `handleStartupPanelSync`.
- `messageCreate`: procesa anuncios de Jockie, eventos del panel y reposicionamiento del panel.
- `interactionCreate`: delega en comandos, botones o modales.
- `messageDelete`: delega en la limpieza de letras.
- `voiceStateUpdate`: delega en la desconexión de bots de música.

`src/core/BotClient.ts` extiende `Client`, carga comandos e interacciones y mantiene las colecciones de comandos, botones y modales. El scaffolding de modales (`modalHandler` y `modalInteractions`) se conserva como punto de extensión.

Los módulos principales por responsabilidad son:

- `src/utils/jockieIds.ts`: IDs de bots de música y detección exacta.
- `src/globalClient.ts`: registro único del cliente global.
- `src/services/botActivity.ts`: actividad deduplicada del bot.
- `src/services/channelCleanup.ts`: limpieza de mensajes gestionados y predicados compartidos.
- `src/utils/jockieMusicAnnouncer.ts`: detección de inicio, fin y refresco de Jockie.
- `src/utils/musicPanelEvents.ts`: sincronización del panel con anuncios de Jockie.
- `src/lyrics/LyricsManager.ts`: botón de letras y publicación.
- `src/lyrics/lyricsCleanupScheduler.ts`: limpieza diferida y cancelable de letras.
- `src/utils/stateManager.ts`: persistencia del estado del panel.

## 3. Flujo del panel

El comando `/music` valida el canal antes de diferir. Luego usa `deferReply()` público, publica el panel con `editReply` y guarda el estado con `writePanelState`. La confirmación se envía después mediante un `followUp` efímero. Si falla algo después del defer, se intenta borrar la respuesta diferida y enviar un `followUp` efímero con el error; si no se puede borrar, se usa `editReply` como último recurso.

El panel se genera con `createHelpMessage`. El botón "Letra" se habilita según `lyricsEnabled` o, si no se especifica, según `currentActivityType === 2` (Listening).

El reposicionamiento vive en `src/utils/panelRepositionHandler.ts`. Cuando llega un mensaje relevante en el canal del panel, se espera un delay fijo de 500 ms, se borra el panel anterior y se envía uno nuevo al final. No hay cola ni debounce adicional.

La limpieza de paneles anteriores usa `cleanupAllHelpPanels` en `src/utils/panelCleaner.ts`: lee los últimos 100 mensajes, filtra con `isPanelEmbedMessage` y borra en lote.

El comando `/disable` valida el canal y el servidor antes de diferir. Después usa `deferReply({ ephemeral: true })`, elimina el panel, el archivo de estado y la configuración de autodetección del canal, y responde con `editReply` efímero.

Los botones se enrutan en `src/utils/buttonHandler.ts`. El cierre de grupos de letras se maneja en `src/interactions/close.ts` mediante el prefijo `CLOSE_LYRICS_PREFIX`.

## 4. Flujo de “Ahora suena”

`src/utils/jockieMusicAnnouncer.ts` detecta eventos de Jockie con `detectJockieMusicStatus` y el texto del mensaje. Sus ramas son:

- Inicio de canción (`started playing`):
  - Actualiza la actividad a Listening con el texto `▶️ - <canción> by <artista>`.
  - Cancela cualquier limpieza de letras pendiente del canal.
  - Limpia panel, “Ahora suena” y letras con una sola llamada a `purgeManagedMessages`.
  - Envía un panel nuevo.
  - Envía el embed “¡Ahora suena!” en el canal del panel.
  - Si el anuncio llegó en otro canal, envía también allí el embed de reproducción.
  - Protege la rama con `currentlyPlayingLock` para ignorar anuncios duplicados del mismo canal.

- Fin de canción (`NoMoreTracks` o `Leaving`):
  - Vuelve la actividad al estado por defecto (Watching).
  - Limpia panel, “Ahora suena” y letras con una sola llamada a `purgeManagedMessages`.
  - Envía un panel nuevo.

- Refresco alternativo:
  - Si el mensaje relevante llegó en el canal del panel y no es un `started playing`, se borra el panel y se envía uno nuevo. No se limpian “Ahora suena” ni letras en esta rama.

El embed “¡Ahora suena!” usa el título compartido `NOW_PLAYING_EMBED_TITLE` y muestra el nombre del miembro de Jockie si está en caché, o un texto genérico en caso contrario.

## 5. Flujo de letras

El botón “Letra” se atiende en `handleLyricsButton`:

1. Dife la interacción de forma efímera.
2. Valida el canal y cancela cualquier limpieza pendiente de ese canal.
3. Si ya hay un grupo de letras activo, responde con el enlace al primer mensaje.
4. Limpia letras huérfanas con `cleanupLyrics`.
5. Busca el anuncio de Jockie con `started playing` en los últimos 30 mensajes.
6. Extrae título y artistas con `parseJockieSongFromEmbed`.
7. Busca la letra con `findLyrics`, que prueba artistas de forma secuencial y conserva el fallback por lista completa de artistas.
8. Publica la letra en partes de hasta 2000 caracteres, agrega la confirmación y coloca el botón “Cerrar” en el último mensaje.
9. Registra los IDs en `lyricsMessageMap` y el grupo activo en `lyricsActiveGroupByChannel`.

La limpieza de letras tiene dos caminos:

- `cleanupLyrics` borra el grupo activo por mapa y luego busca mensajes huérfanos en los últimos 50 mensajes usando `isLyricsEmbedMessage`.
- `onStop` usa `scheduleLyricsCleanup`, que mantiene un único timer por canal. Al iniciar una canción nueva, al publicar letras nuevas o al recibir un nuevo “Ahora suena”, el timer pendiente se cancela.

El prefijo del footer se comparte mediante `LYRICS_EMBED_FOOTER_PREFIX` en `src/lyrics/lyricsConstants.ts`.

## 6. Flujo de arranque

`handleStartupPanelSync` en `src/core/startupHandler.ts` usa `readAllPanelStates` para recorrer los estados persistidos. Para cada estado válido:

1. Obtiene el servidor y el canal.
2. Limpia paneles anteriores con `cleanupAllHelpPanels`.
3. Limpia letras con `cleanupLyrics`.
4. Reposiciona el panel con `repositionPanel` y persiste el nuevo ID.
5. Calcula `nowPlaying` una sola vez por canal con `findJockieNowPlayingSong`, dentro de un `try/catch` que trata cualquier error como “sin canción”.
6. Pasa ese resultado a `syncPanelLyricsButton`.
7. Usa el mismo resultado para establecer la actividad de la primera canción encontrada.

Si ningún canal tiene una canción activa, la actividad vuelve al estado por defecto.

En el evento `ready`, `src/index.ts` también limpia las sugerencias de comando antiguas con `cleanupAllSuggestions`.

## 7. Estrategia de limpieza de mensajes gestionados

`src/services/channelCleanup.ts` centraliza los predicados y la limpieza:

- `isPanelEmbedMessage`: exige autor del bot y título que incluya `PANEL_EMBED_TITLE_MATCH`.
- `isNowPlayingEmbedMessage`: exige autor del bot y título exactamente `NOW_PLAYING_EMBED_TITLE`.
- `isLyricsEmbedMessage`: exige autor del bot y footer con `LYRICS_EMBED_FOOTER_PREFIX`, o título exactamente `LYRICS_CONFIRMATION_EMBED_TITLE`.

Los predicados nunca coinciden con `🎵 Sugerencia de comando`.

`purgeManagedMessages` realiza una sola lectura de historial por llamada:

1. Lee hasta 100 mensajes.
2. Construye un `Set` con los IDs que coinciden con las categorías habilitadas.
3. Si `lyrics` está habilitado, agrega los IDs del grupo activo desde `lyricsMessageMap` y `lyricsActiveGroupByChannel`, aunque la lectura del historial haya fallado.
4. Deduplica por construcción con el `Set`.
5. Separa mensajes recientes y antiguos con `SnowflakeUtil.timestampFrom` y el límite de dos semanas.
6. Borra los recientes en lotes de hasta 100 con `bulkDelete(lote, true)`.
7. Si un lote falla, reintenta ese lote de forma individual.
8. Borra los antiguos individualmente usando el mensaje ya obtenido o recuperándolo por ID.
9. Si la lectura falla, registra una advertencia y continúa con los IDs de letras que estaban en memoria.
10. Limpia los mapas de letras solo cuando `lyrics` está habilitado.
11. Registra un resumen con mensajes obtenidos, coincidentes, borrados y fallidos.

Las limpiezas específicas conservan sus límites:

- Paneles: 100 mensajes y `bulkDelete`.
- Letras: grupo activo por mapa y escaneo de 50 mensajes.
- Sugerencias: escaneo de 50 mensajes y borrado solo de las que superan el tiempo de autodestrucción.

## 8. Política de actividad única

`src/services/botActivity.ts` expone `setBotActivity`. El servicio:

- Obtiene el cliente con `getClient`.
- Mantiene el último texto y tipo aplicados.
- Omite la llamada a Discord si el texto y el tipo no cambiaron.
- Actualiza `client.currentActivityType` cuando aplica el cambio.
- Emite una advertencia clara si el cliente o su usuario no están disponibles.

La actividad de reproducción usa el tipo Listening y el estado por defecto usa Watching. Los eventos de inicio, fin, desconexión de voz y arranque pasan por este servicio.

## 9. Política de una sola búsqueda al arrancar

`src/utils/activitySync.ts` define `JockieSongInfo` y las funciones `parseJockieSongFromEmbed` y `findJockieNowPlayingSong`. El arranque calcula la canción una sola vez por canal y reutiliza el resultado para dos fines:

- Sincronizar el botón “Letra” del panel.
- Establecer la actividad del bot.

`syncPanelLyricsButton` acepta un tercer parámetro opcional:

- `undefined`: busca la canción en el canal.
- `null`: interpreta que no hay canción.
- `JockieSongInfo`: usa el resultado recibido sin buscar de nuevo.

## 10. Política de fetch nativo sin caché

`src/services/lyricsFetcher.ts` usa el `fetch` global de Node con `AbortSignal.timeout(10000)`. No se usa `node-fetch`, `AbortController` manual ni caché de letras.

La función conserva las mismas URLs, el mismo parseo de respuesta y los mismos errores personalizados:

- 404: `LyricsNotFoundError`.
- Respuesta no OK: `LyricsAPIError`.
- Respuesta sin campo `lyrics`: `LyricsNotFoundError`.
- Timeout (`TimeoutError` o `AbortError`): `LyricsTimeoutError`.

Solo se registran advertencias y errores útiles; no se registran URLs ni tiempos de respuesta.

## 11. Política de interacciones diferidas

Las interacciones que pueden superar el límite de 3 segundos de Discord se difieren antes del trabajo pesado:

- `/music`: `deferReply()` público, panel por `editReply` y confirmación por `followUp` efímero.
- `/disable`: `deferReply({ ephemeral: true })` y respuesta final por `editReply`.
- Botón “Letra”: `deferReply({ ephemeral: true })` y publicación posterior.

Los errores posteriores al defer no generan una segunda respuesta independiente: se borra la respuesta diferida y se envía un `followUp` efímero, o se usa `editReply` si el borrado no es posible.

## 12. Persistencia en JSON sin caché

La persistencia se apoya en archivos dentro de `DB_DIR`:

- `bot-state-<guildId>.json`: estado del panel, con `guildId`, `channelId` y `lastHelpMessageId`.
- `autodetect-<guildId>-<channelId>.json`: estado de autodetección por canal.

`src/utils/stateManager.ts` expone las lecturas y escrituras del estado del panel, incluida `readAllPanelStates`. `src/utils/autoDetectState.ts` expone la lectura y escritura de autodetección.

Las operaciones usan `fs` de forma síncrona. No hay caché de estado en memoria ni escritura asíncrona. `/disable` elimina el archivo de estado y el archivo de autodetección correspondiente.

## 13. Convenciones de código y documentación

- TypeScript estricto y CommonJS.
- Imports al inicio del archivo.
- Nombres de símbolos en inglés, siguiendo el estilo existente.
- JSDoc en español para símbolos exportados y funciones internas no triviales.
- Sin `any` nuevos.
- Archivos de 250 líneas o menos.
- Sin barrels ni re-exports.
- Sin código muerto.
- Sin duplicación de constantes, predicados, parseos de entorno ni acceso al cliente.
- Comentarios que expliquen comportamiento, no cambios realizados.
- Documentación sin fechas, changelogs ni notas de parche.

## 14. Reglas de mantenimiento para no reintroducir duplicaciones

- Leer IDs de Jockie solo con `getJockieBotIds` o `isJockieBotId`.
- Acceder al cliente solo con `getClient`.
- Cambiar la actividad solo con `setBotActivity`.
- Limpiar mensajes gestionados con `purgeManagedMessages` o con los predicados compartidos.
- Usar `LYRICS_EMBED_FOOTER_PREFIX` para identificar letras.
- Usar `scheduleLyricsCleanup` y `cancelLyricsCleanup` para la limpieza diferida.
- Usar las constantes de títulos y prefijos de `src/utils/constants.ts`.
- Reutilizar `JockieSongInfo` y el resultado de `findJockieNowPlayingSong`.
- No agregar caché de estado ni de letras.
- No agregar colas ni debounce al reposicionamiento del panel.
- Al cambiar una firma, actualizar todos los llamadores en lugar de crear wrappers de compatibilidad.
- Al agregar una categoría nueva de mensaje gestionado, agregar su predicado y su opción en `purgeManagedMessages`, y reutilizarla en las limpiezas existentes.

## 15. Nota operativa

Para producción, compilar con `npm run build` y ejecutar con `npm run start`. No usar `npm run dev` en producción: el watcher de desarrollo agrega consumo de CPU y reinicios innecesarios.

La instancia recomendada es un solo proceso con un solo shard, sobre Node.js 24.22.1, con la carpeta `db/` montada como volumen persistente y escribible por el usuario del contenedor.
